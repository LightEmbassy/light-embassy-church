-- Hide correct_answer column from clients via column-level grants.
-- The "Anyone can view quiz questions" RLS policy stays, but anon/authenticated
-- can only select non-sensitive columns. Grading now happens in an edge function.
REVOKE SELECT ON public.quiz_questions FROM anon, authenticated;
GRANT SELECT (id, question, options, order_number, podcast_url, podcast_title, created_at)
  ON public.quiz_questions TO anon, authenticated;
GRANT ALL ON public.quiz_questions TO service_role;