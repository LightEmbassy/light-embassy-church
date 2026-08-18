-- 1. Achievements RPC: only allow awarding to the caller
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id uuid)
 RETURNS TABLE(new_achievement achievement_type)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  video_count INT;
  podcast_count INT;
  total_count INT;
  streak_days INT;
  first_watch TIMESTAMP;
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COUNT(*) INTO video_count FROM media_history WHERE user_id = p_user_id AND media_type = 'video';
  SELECT COUNT(*) INTO podcast_count FROM media_history WHERE user_id = p_user_id AND media_type = 'podcast';
  total_count := video_count + podcast_count;

  IF video_count >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'first_video')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF podcast_count >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'first_podcast')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF video_count >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'videos_10')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF video_count >= 25 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'videos_25')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF video_count >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'videos_50')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF podcast_count >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'podcasts_10')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF podcast_count >= 25 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'podcasts_25')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF podcast_count >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'podcasts_50')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  IF total_count >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'total_100')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  SELECT COUNT(DISTINCT DATE(watched_at)) INTO streak_days
  FROM media_history WHERE user_id = p_user_id AND watched_at >= NOW() - INTERVAL '7 days';

  IF streak_days >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'weekly_streak')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  SELECT MIN(watched_at) INTO first_watch FROM media_history
  WHERE user_id = p_user_id AND EXTRACT(HOUR FROM watched_at) < 7;

  IF first_watch IS NOT NULL THEN
    INSERT INTO user_achievements (user_id, achievement) VALUES (p_user_id, 'early_bird')
    ON CONFLICT (user_id, achievement) DO NOTHING RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;

  RETURN;
END;
$function$;

-- 2. Forum: block identity spoofing on insert
DROP POLICY IF EXISTS "Anyone can create topics" ON public.forum_topics;
CREATE POLICY "Anyone can create topics"
ON public.forum_topics FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

DROP POLICY IF EXISTS "Anyone can create replies" ON public.forum_replies;
CREATE POLICY "Anyone can create replies"
ON public.forum_replies FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- 3. Quiz answers: public view without correct_answer; table select limited to admins
CREATE OR REPLACE VIEW public.quiz_questions_public
WITH (security_invoker = on) AS
SELECT id, question, options, order_number, podcast_url, podcast_title, created_at
FROM public.quiz_questions;

GRANT SELECT ON public.quiz_questions_public TO anon, authenticated;

REVOKE SELECT ON public.quiz_questions FROM anon, authenticated;
GRANT SELECT (id, question, options, order_number, podcast_url, podcast_title, created_at)
  ON public.quiz_questions TO anon, authenticated;
GRANT ALL ON public.quiz_questions TO service_role;