-- Create table to track user media consumption history
CREATE TABLE public.media_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'podcast')),
  media_id UUID NOT NULL,
  media_title TEXT NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.media_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view their own media history"
ON public.media_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own history entries
CREATE POLICY "Users can create their own media history"
ON public.media_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_media_history_user_id ON public.media_history(user_id);
CREATE INDEX idx_media_history_watched_at ON public.media_history(watched_at DESC);