-- Create a view for public conversation subjects (no private content)
CREATE VIEW public.public_conversations
WITH (security_invoker=on) AS
  SELECT 
    id,
    subject,
    created_at,
    status
  FROM public.conversations
  WHERE status = 'open'
  ORDER BY created_at DESC
  LIMIT 10;

-- Add RLS policy for anyone to view the public_conversations view
-- The view itself only exposes subjects, not private content