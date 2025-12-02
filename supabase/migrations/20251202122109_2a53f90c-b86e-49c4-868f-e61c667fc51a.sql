-- Create post likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view post likes"
ON public.post_likes
FOR SELECT
USING (true);

-- Authenticated users can like posts
CREATE POLICY "Authenticated users can like posts"
ON public.post_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike (delete) their own likes
CREATE POLICY "Users can unlike posts"
ON public.post_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for likes count
CREATE TRIGGER update_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_likes_count();