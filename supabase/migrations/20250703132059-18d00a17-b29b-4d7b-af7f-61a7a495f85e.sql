-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'counsellor', 'staff', 'moderator', 'admin');

-- Create enum for message status
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read', 'moderated', 'flagged');

-- Create enum for conversation status
CREATE TYPE public.conversation_status AS ENUM ('active', 'closed', 'pending_moderation', 'escalated');

-- Add role to profiles table
ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  staff_id UUID,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  status conversation_status NOT NULL DEFAULT 'active',
  priority INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
  category TEXT DEFAULT 'general', -- counselling, prayer, support, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  status message_status NOT NULL DEFAULT 'sent',
  is_from_staff BOOLEAN NOT NULL DEFAULT false,
  moderated_by UUID,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_notifications table for tracking read status
CREATE TABLE public.message_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = staff_id);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view assigned conversations" 
ON public.conversations 
FOR SELECT 
USING (
  auth.uid() = staff_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('staff', 'counsellor', 'moderator', 'admin')
  )
);

CREATE POLICY "Staff can update conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  auth.uid() = staff_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('staff', 'counsellor', 'moderator', 'admin')
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (user_id = auth.uid() OR staff_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('staff', 'counsellor', 'moderator', 'admin')
  )
);

CREATE POLICY "Users can send messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  (EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (user_id = auth.uid() OR staff_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('staff', 'counsellor', 'moderator', 'admin')
  ))
);

-- RLS Policies for message_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.message_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.message_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.message_notifications 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_staff_id ON public.conversations(staff_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_message_notifications_user_id ON public.message_notifications(user_id);
CREATE INDEX idx_message_notifications_is_read ON public.message_notifications(is_read);

-- Create triggers for updating timestamps
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update conversation last_message_at when new message is added
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

-- Function to create notifications for new messages
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
BEGIN
  -- Determine who should receive the notification
  IF NEW.is_from_staff THEN
    -- Message from staff, notify the user
    SELECT user_id INTO recipient_id 
    FROM public.conversations 
    WHERE id = NEW.conversation_id;
  ELSE
    -- Message from user, notify the assigned staff member
    SELECT staff_id INTO recipient_id 
    FROM public.conversations 
    WHERE id = NEW.conversation_id;
  END IF;
  
  -- Create notification if recipient exists and is not the sender
  IF recipient_id IS NOT NULL AND recipient_id != NEW.sender_id THEN
    INSERT INTO public.message_notifications (user_id, message_id, conversation_id)
    VALUES (recipient_id, NEW.id, NEW.conversation_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_message_notification_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.create_message_notification();