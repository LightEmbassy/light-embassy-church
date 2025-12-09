-- Drop and recreate the view with SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.public_prayer_requests;

CREATE VIEW public.public_prayer_requests 
WITH (security_invoker = true)
AS
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
FROM prayer_requests
WHERE is_public = true AND status = 'approved'::text;