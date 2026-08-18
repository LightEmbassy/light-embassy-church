ALTER TABLE public.prayer_requests ALTER COLUMN user_id DROP NOT NULL;

UPDATE public.prayer_requests SET user_id = NULL WHERE user_id = '00000000-0000-0000-0000-000000000000';

CREATE OR REPLACE VIEW public.prayer_wall_public
WITH (security_invoker = off) AS
SELECT
  pr.id,
  pr.title,
  pr.description,
  pr.category,
  pr.is_anonymous,
  pr.request_pastoral_counselling,
  pr.created_at,
  pr.user_id
FROM public.prayer_requests pr
WHERE pr.is_public = true AND pr.status = 'approved';

GRANT SELECT ON public.prayer_wall_public TO anon, authenticated;
