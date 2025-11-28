-- Update RLS policies to allow public read access for public-facing content

-- Podcasts: Allow anyone to view (already public, kept for completeness)
DROP POLICY IF EXISTS "Anyone can view podcasts" ON public.podcasts;
CREATE POLICY "Anyone can view podcasts" ON public.podcasts FOR SELECT USING (true);

-- Videos: Allow anyone to view (already public, kept for completeness)
DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;
CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);

-- Quiz questions: Allow anyone to view (already public, kept for completeness)
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);

-- Prayer requests: Allow anyone to view public prayers
DROP POLICY IF EXISTS "Anyone can view public prayers" ON public.prayer_requests;
CREATE POLICY "Anyone can view public prayers" ON public.prayer_requests 
FOR SELECT USING (is_public = true);

-- Profiles: Allow anyone to view profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);