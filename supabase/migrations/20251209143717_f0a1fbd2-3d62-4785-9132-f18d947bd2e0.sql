-- Add guest_name column to forum_topics for anonymous users
ALTER TABLE public.forum_topics 
ADD COLUMN guest_name TEXT,
ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_name column to forum_replies for anonymous users
ALTER TABLE public.forum_replies 
ADD COLUMN guest_name TEXT,
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies for forum_topics to allow anonymous inserts
DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.forum_topics;
CREATE POLICY "Anyone can create topics" 
ON public.forum_topics 
FOR INSERT 
WITH CHECK (true);

-- Update RLS policies for forum_replies to allow anonymous inserts
DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.forum_replies;
CREATE POLICY "Anyone can create replies" 
ON public.forum_replies 
FOR INSERT 
WITH CHECK (true);