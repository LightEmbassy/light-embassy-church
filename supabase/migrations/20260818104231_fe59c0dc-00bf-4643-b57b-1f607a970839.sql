REVOKE SELECT ON public.quiz_questions FROM anon, authenticated;
GRANT SELECT (id, question, options, order_number, created_at, podcast_url, podcast_title) ON public.quiz_questions TO anon, authenticated;
GRANT ALL ON public.quiz_questions TO service_role;