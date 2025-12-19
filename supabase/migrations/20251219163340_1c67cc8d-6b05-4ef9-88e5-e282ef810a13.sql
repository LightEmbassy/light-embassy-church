-- Fix the security definer view issue by using SECURITY INVOKER
DROP VIEW IF EXISTS public.public_prayer_requests;

-- Recreate view with security_invoker to enforce RLS of the querying user
CREATE VIEW public.public_prayer_requests 
WITH (security_invoker = true) AS
SELECT 
  id,
  title,
  description,
  category,
  status,
  is_anonymous,
  is_public,
  request_pastoral_counselling,
  user_id,
  created_at,
  updated_at
FROM public.prayer_requests
WHERE is_public = true 
  AND status = 'approved'::text;