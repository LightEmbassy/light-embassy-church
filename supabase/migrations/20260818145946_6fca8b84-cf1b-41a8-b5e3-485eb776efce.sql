DROP VIEW IF EXISTS public.prayer_wall_public;

CREATE OR REPLACE FUNCTION public.list_public_prayers(_category text DEFAULT NULL, _search text DEFAULT NULL, _limit integer DEFAULT 50)
RETURNS TABLE(id uuid, title text, description text, category text, is_anonymous boolean, request_pastoral_counselling boolean, created_at timestamptz, user_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pr.id, pr.title, pr.description, pr.category, pr.is_anonymous,
         pr.request_pastoral_counselling, pr.created_at, pr.user_id
  FROM public.prayer_requests pr
  WHERE pr.is_public = true
    AND pr.status = 'approved'
    AND (_category IS NULL OR _category = 'all' OR pr.category = _category)
    AND (_search IS NULL OR _search = '' OR pr.title ILIKE '%' || _search || '%' OR pr.description ILIKE '%' || _search || '%')
  ORDER BY pr.created_at DESC
  LIMIT LEAST(COALESCE(_limit, 50), 100)
$$;

GRANT EXECUTE ON FUNCTION public.list_public_prayers(text, text, integer) TO anon, authenticated;
