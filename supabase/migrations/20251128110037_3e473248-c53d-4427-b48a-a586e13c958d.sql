-- ====================================================================
-- Apply remaining tables with security fixes
-- ====================================================================

-- Quiz tables
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.user_quiz_completion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_completion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions
FOR SELECT
USING (true);

CREATE POLICY "Users view own responses"
ON public.user_quiz_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own responses"
ON public.user_quiz_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own completion"
ON public.user_quiz_completion
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own completion"
ON public.user_quiz_completion
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert quiz questions
INSERT INTO public.quiz_questions (question, options, correct_answer, order_number) VALUES
('What is the first book of the Bible?', '["Genesis", "Exodus", "Leviticus", "Numbers"]', 0, 1),
('Who led the Israelites out of Egypt?', '["Abraham", "Moses", "David", "Solomon"]', 1, 2),
('How many disciples did Jesus have?', '["10", "11", "12", "13"]', 2, 3),
('What city was Jesus born in?', '["Jerusalem", "Nazareth", "Bethlehem", "Capernaum"]', 2, 4),
('What does the word "Gospel" mean?', '["Good News", "Holy Book", "Prayer", "Blessing"]', 0, 5)
ON CONFLICT DO NOTHING;

-- Prayer interactions table
CREATE TABLE IF NOT EXISTS public.prayer_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'prayed_for',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prayer_request_id, user_id, interaction_type)
);

ALTER TABLE public.prayer_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view prayer interactions"
ON public.prayer_interactions
FOR SELECT
USING (true);

CREATE POLICY "Users create own interactions"
ON public.prayer_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own interactions"
ON public.prayer_interactions
FOR DELETE
USING (auth.uid() = user_id);

-- Conversations table with secure staff access
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  staff_id UUID,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  status conversation_status NOT NULL DEFAULT 'active',
  priority INTEGER NOT NULL DEFAULT 1,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = staff_id);

CREATE POLICY "Users create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff view all conversations"
ON public.conversations
FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff update conversations"
ON public.conversations
FOR UPDATE
USING (
  auth.uid() = staff_id
  OR public.is_staff(auth.uid())
);

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Messages table with secure staff access
CREATE TABLE IF NOT EXISTS public.messages (
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

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view messages in conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id
    AND (user_id = auth.uid() OR staff_id = auth.uid())
  )
  OR public.is_staff(auth.uid())
);

CREATE POLICY "Users send messages in conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (user_id = auth.uid() OR staff_id = auth.uid())
    )
    OR public.is_staff(auth.uid())
  )
);

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Message notifications
CREATE TABLE IF NOT EXISTS public.message_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.message_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.message_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System create notifications"
ON public.message_notifications
FOR INSERT
WITH CHECK (true);

-- Favorite verses table
CREATE TABLE IF NOT EXISTS public.favorite_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.favorite_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own verses"
ON public.favorite_verses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own verses"
ON public.favorite_verses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own verses"
ON public.favorite_verses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own verses"
ON public.favorite_verses
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_favorite_verses_updated_at
BEFORE UPDATE ON public.favorite_verses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper functions and triggers
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_last_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
BEGIN
  IF NEW.is_from_staff THEN
    SELECT user_id INTO recipient_id FROM public.conversations WHERE id = NEW.conversation_id;
  ELSE
    SELECT staff_id INTO recipient_id FROM public.conversations WHERE id = NEW.conversation_id;
  END IF;
  
  IF recipient_id IS NOT NULL AND recipient_id != NEW.sender_id THEN
    INSERT INTO public.message_notifications (user_id, message_id, conversation_id)
    VALUES (recipient_id, NEW.id, NEW.conversation_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_message_notification_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.create_message_notification();

-- Create indexes
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_staff_id ON public.conversations(staff_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_message_notifications_user_id ON public.message_notifications(user_id);
CREATE INDEX idx_message_notifications_is_read ON public.message_notifications(is_read);