-- Create table for favorite verses
CREATE TABLE public.favorite_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.favorite_verses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorite verses" 
ON public.favorite_verses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite verses" 
ON public.favorite_verses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite verses" 
ON public.favorite_verses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite verses" 
ON public.favorite_verses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_favorite_verses_updated_at
BEFORE UPDATE ON public.favorite_verses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();