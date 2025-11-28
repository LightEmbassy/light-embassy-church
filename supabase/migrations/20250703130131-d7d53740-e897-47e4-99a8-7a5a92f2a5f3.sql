-- Create enum for prayer categories
CREATE TYPE public.prayer_category AS ENUM (
  'healing',
  'finance', 
  'family',
  'guidance',
  'thanksgiving',
  'salvation',
  'protection',
  'other'
);

-- Create prayer_requests table
CREATE TABLE public.prayer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category prayer_category NOT NULL DEFAULT 'other',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  request_pastoral_counselling BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prayer_interactions table for tracking "I've prayed for this"
CREATE TABLE public.prayer_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'prayed_for',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prayer_request_id, user_id, interaction_type)
);

-- Enable Row Level Security
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayer_requests
CREATE POLICY "Anyone can view prayer requests" 
ON public.prayer_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own prayer requests" 
ON public.prayer_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer requests" 
ON public.prayer_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer requests" 
ON public.prayer_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for prayer_interactions
CREATE POLICY "Anyone can view prayer interactions" 
ON public.prayer_interactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own prayer interactions" 
ON public.prayer_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer interactions" 
ON public.prayer_interactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_prayer_requests_updated_at
BEFORE UPDATE ON public.prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();