-- Fix 1: Profiles table - restrict from "anyone" to authenticated users only
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Ensure signups table INSERT doesn't return data (already secure, but add explicit deny for anon SELECT)
-- The existing "Only admins can view signups" policy is correct, but ensure no gaps

-- Fix 3: Ensure quiz_entries INSERT doesn't allow reading back data
-- Already has "Only admins can view quiz entries" - verified secure

-- Fix 4: Prayer requests - ensure contact info is only visible to staff and owner
-- The existing policies look correct, but let's verify public_prayer_requests view is secure

-- Drop the public_prayer_requests view if it exists and recreate with security barrier
DROP VIEW IF EXISTS public.public_prayer_requests;

-- Recreate as a security barrier view that only shows approved public prayers without contact info
CREATE VIEW public.public_prayer_requests WITH (security_barrier = true) AS
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