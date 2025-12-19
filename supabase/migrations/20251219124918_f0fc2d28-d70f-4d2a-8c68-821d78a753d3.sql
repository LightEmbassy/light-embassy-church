-- Create achievements enum for badge types
CREATE TYPE public.achievement_type AS ENUM (
  'first_video',
  'first_podcast',
  'videos_10',
  'videos_25',
  'videos_50',
  'podcasts_10',
  'podcasts_25',
  'podcasts_50',
  'total_100',
  'weekly_streak',
  'early_bird'
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement achievement_type NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement)
);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own achievements
CREATE POLICY "Users can create their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS TABLE(new_achievement achievement_type)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_count INT;
  podcast_count INT;
  total_count INT;
  streak_days INT;
  first_watch TIMESTAMP;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO video_count FROM media_history WHERE user_id = p_user_id AND media_type = 'video';
  SELECT COUNT(*) INTO podcast_count FROM media_history WHERE user_id = p_user_id AND media_type = 'podcast';
  total_count := video_count + podcast_count;
  
  -- Check first video
  IF video_count >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'first_video') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  -- Check first podcast
  IF podcast_count >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'first_podcast') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  -- Check video milestones
  IF video_count >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'videos_10') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  IF video_count >= 25 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'videos_25') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  IF video_count >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'videos_50') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  -- Check podcast milestones
  IF podcast_count >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'podcasts_10') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  IF podcast_count >= 25 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'podcasts_25') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  IF podcast_count >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'podcasts_50') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  -- Check total 100
  IF total_count >= 100 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'total_100') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  -- Check weekly streak (7 consecutive days with activity)
  SELECT COUNT(DISTINCT DATE(watched_at)) INTO streak_days
  FROM media_history 
  WHERE user_id = p_user_id 
  AND watched_at >= NOW() - INTERVAL '7 days';
  
  IF streak_days >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'weekly_streak') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  -- Check early bird (watched content before 7 AM)
  SELECT MIN(watched_at) INTO first_watch FROM media_history 
  WHERE user_id = p_user_id AND EXTRACT(HOUR FROM watched_at) < 7;
  
  IF first_watch IS NOT NULL THEN
    INSERT INTO user_achievements (user_id, achievement) 
    VALUES (p_user_id, 'early_bird') 
    ON CONFLICT (user_id, achievement) DO NOTHING
    RETURNING achievement INTO new_achievement;
    IF new_achievement IS NOT NULL THEN RETURN NEXT; END IF;
  END IF;
  
  RETURN;
END;
$$;