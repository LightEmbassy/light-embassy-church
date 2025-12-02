-- Create signups table for email/phone collection
CREATE TABLE public.signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a signup (public form)
CREATE POLICY "Anyone can create signups"
ON public.signups
FOR INSERT
WITH CHECK (true);

-- Only admins can view signups
CREATE POLICY "Only admins can view signups"
ON public.signups
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));