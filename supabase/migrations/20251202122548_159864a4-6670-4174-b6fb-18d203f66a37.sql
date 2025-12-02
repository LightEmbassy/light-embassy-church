-- Add status column for moderation
ALTER TABLE public.prayer_requests 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Drop existing public view policies
DROP POLICY IF EXISTS "Anyone can view public prayers" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can view anonymous public requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can view public non-anonymous requests" ON public.prayer_requests;

-- Create new policy: public can only see approved public prayers
CREATE POLICY "Anyone can view approved public prayers"
ON public.prayer_requests
FOR SELECT
USING (is_public = true AND status = 'approved');

-- Staff can view ALL prayers (for moderation)
CREATE POLICY "Staff can view all prayers"
ON public.prayer_requests
FOR SELECT
USING (is_staff(auth.uid()));

-- Staff can update any prayer (for moderation)
CREATE POLICY "Staff can update any prayer"
ON public.prayer_requests
FOR UPDATE
USING (is_staff(auth.uid()));