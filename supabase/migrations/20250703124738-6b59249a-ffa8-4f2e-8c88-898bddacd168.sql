-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user quiz responses table
CREATE TABLE public.user_quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Create user quiz completion table
CREATE TABLE public.user_quiz_completion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_completion ENABLE ROW LEVEL SECURITY;

-- Quiz questions are public (everyone can read)
CREATE POLICY "Anyone can view quiz questions" 
ON public.quiz_questions 
FOR SELECT 
USING (true);

-- Users can only see their own responses
CREATE POLICY "Users can view their own responses" 
ON public.user_quiz_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own responses" 
ON public.user_quiz_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only see their own completion record
CREATE POLICY "Users can view their own completion" 
ON public.user_quiz_completion 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completion" 
ON public.user_quiz_completion 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add quiz_completed column to profiles
ALTER TABLE public.profiles 
ADD COLUMN quiz_completed BOOLEAN NOT NULL DEFAULT false;

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (question, options, correct_answer, order_number) VALUES
('What is the first book of the Bible?', '["Genesis", "Exodus", "Leviticus", "Numbers"]', 0, 1),
('Who led the Israelites out of Egypt?', '["Abraham", "Moses", "David", "Solomon"]', 1, 2),
('How many disciples did Jesus have?', '["10", "11", "12", "13"]', 2, 3),
('What city was Jesus born in?', '["Jerusalem", "Nazareth", "Bethlehem", "Capernaum"]', 2, 4),
('What does the word "Gospel" mean?', '["Good News", "Holy Book", "Prayer", "Blessing"]', 0, 5);