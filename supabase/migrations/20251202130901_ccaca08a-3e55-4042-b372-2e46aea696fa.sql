
-- Add podcast_url column to quiz_questions
ALTER TABLE quiz_questions ADD COLUMN podcast_url TEXT;

-- Update existing questions with podcast episode URLs
UPDATE quiz_questions SET podcast_url = 'https://lightembassychurch.podbean.com/e/is-healing-for-everyone/' WHERE order_number = 1;
UPDATE quiz_questions SET podcast_url = 'https://lightembassychurch.podbean.com/e/his-word-is-greater-than-feeling/' WHERE order_number = 2;
UPDATE quiz_questions SET podcast_url = 'https://lightembassychurch.podbean.com/e/containers-of-life/' WHERE order_number = 3;
UPDATE quiz_questions SET podcast_url = 'https://lightembassychurch.podbean.com/e/a-greater-love/' WHERE order_number = 4;
UPDATE quiz_questions SET podcast_url = 'https://lightembassychurch.podbean.com/e/the-faith-of-abraham-an-unmissable-life-transforming-podcast/' WHERE order_number = 5;
