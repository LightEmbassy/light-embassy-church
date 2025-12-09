-- Create a secure view for public prayer requests that excludes sensitive contact information
-- This view should be used for public-facing queries instead of direct table access

CREATE OR REPLACE VIEW public.public_prayer_requests AS
SELECT 
  id,
  title,
  description,
  category,
  is_anonymous,
  is_public,
  request_pastoral_counselling,
  status,
  user_id,
  created_at,
  updated_at
FROM public.prayer_requests
WHERE is_public = true AND status = 'approved';

-- Grant SELECT access on the view to authenticated and anonymous users
GRANT SELECT ON public.public_prayer_requests TO authenticated;
GRANT SELECT ON public.public_prayer_requests TO anon;

-- Drop the overly permissive RLS policy that exposes contact fields
DROP POLICY IF EXISTS "Anyone can view approved public prayers" ON public.prayer_requests;

-- Create a new restrictive policy that only allows staff to see approved public prayers directly
-- Public users should use the view instead
CREATE POLICY "Staff can view approved public prayers directly" 
ON public.prayer_requests 
FOR SELECT 
USING (
  (is_public = true AND status = 'approved' AND is_staff(auth.uid()))
);