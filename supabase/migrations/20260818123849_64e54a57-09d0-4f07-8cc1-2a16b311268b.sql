CREATE OR REPLACE FUNCTION public.admin_list_quiz_questions()
RETURNS TABLE(id uuid, question text, options jsonb, correct_answer integer, order_number integer, podcast_url text, podcast_title text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT q.id, q.question, q.options, q.correct_answer, q.order_number, q.podcast_url, q.podcast_title, q.created_at
  FROM public.quiz_questions q
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY q.order_number ASC, q.created_at ASC
$$;

REVOKE ALL ON FUNCTION public.admin_list_quiz_questions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_quiz_questions() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_quiz_stats()
RETURNS TABLE(total_questions bigint, total_responses bigint, total_completions bigint, correct_responses bigint, distinct_participants bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT count(*) FROM public.quiz_questions),
    (SELECT count(*) FROM public.user_quiz_responses),
    (SELECT count(*) FROM public.user_quiz_completion),
    (SELECT count(*) FROM public.user_quiz_responses WHERE is_correct),
    (SELECT count(DISTINCT user_id) FROM public.user_quiz_responses)
  WHERE public.has_role(auth.uid(), 'admin')
$$;

REVOKE ALL ON FUNCTION public.admin_quiz_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_quiz_stats() TO authenticated;