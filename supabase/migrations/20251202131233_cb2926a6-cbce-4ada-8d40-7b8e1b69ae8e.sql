
-- Add podcast_title column to quiz_questions
ALTER TABLE quiz_questions ADD COLUMN podcast_title TEXT;

-- Update existing questions with podcast episode titles
UPDATE quiz_questions SET podcast_title = 'Is Healing For Everyone?' WHERE order_number = 1;
UPDATE quiz_questions SET podcast_title = 'His Word Is Greater Than Feeling' WHERE order_number = 2;
UPDATE quiz_questions SET podcast_title = 'Containers Of Life' WHERE order_number = 3;
UPDATE quiz_questions SET podcast_title = 'A Greater Love' WHERE order_number = 4;
UPDATE quiz_questions SET podcast_title = 'The Faith Of Abraham' WHERE order_number = 5;
