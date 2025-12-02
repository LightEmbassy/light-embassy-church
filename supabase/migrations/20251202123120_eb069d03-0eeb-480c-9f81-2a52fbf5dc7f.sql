-- Update policy to allow anonymous prayer submissions
DROP POLICY IF EXISTS "Users can create their own requests" ON public.prayer_requests;

-- Allow anyone to submit prayer requests (both authenticated and anonymous)
CREATE POLICY "Anyone can submit prayer requests"
ON public.prayer_requests
FOR INSERT
WITH CHECK (true);