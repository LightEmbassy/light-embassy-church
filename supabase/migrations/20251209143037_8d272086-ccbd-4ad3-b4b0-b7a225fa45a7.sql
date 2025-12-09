-- Create forum_topics table
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_topics
CREATE POLICY "Anyone can view approved topics" 
ON public.forum_topics 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can view their own topics" 
ON public.forum_topics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all topics" 
ON public.forum_topics 
FOR SELECT 
USING (is_staff(auth.uid()));

CREATE POLICY "Authenticated users can create topics" 
ON public.forum_topics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" 
ON public.forum_topics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can update any topic" 
ON public.forum_topics 
FOR UPDATE 
USING (is_staff(auth.uid()));

CREATE POLICY "Users can delete their own topics" 
ON public.forum_topics 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can delete any topic" 
ON public.forum_topics 
FOR DELETE 
USING (is_staff(auth.uid()));

-- RLS policies for forum_replies
CREATE POLICY "Anyone can view approved replies" 
ON public.forum_replies 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can view their own replies" 
ON public.forum_replies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all replies" 
ON public.forum_replies 
FOR SELECT 
USING (is_staff(auth.uid()));

CREATE POLICY "Authenticated users can create replies" 
ON public.forum_replies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
ON public.forum_replies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can update any reply" 
ON public.forum_replies 
FOR UPDATE 
USING (is_staff(auth.uid()));

CREATE POLICY "Users can delete their own replies" 
ON public.forum_replies 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can delete any reply" 
ON public.forum_replies 
FOR DELETE 
USING (is_staff(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_forum_topics_updated_at
BEFORE UPDATE ON public.forum_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
BEFORE UPDATE ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_replies;