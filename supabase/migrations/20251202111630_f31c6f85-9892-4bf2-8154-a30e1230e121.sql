-- Create table for quiz email entries
CREATE TABLE public.quiz_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_entries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public quiz entry)
CREATE POLICY "Anyone can submit quiz entry"
ON public.quiz_entries
FOR INSERT
WITH CHECK (true);

-- Only admins can view entries
CREATE POLICY "Only admins can view quiz entries"
ON public.quiz_entries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));