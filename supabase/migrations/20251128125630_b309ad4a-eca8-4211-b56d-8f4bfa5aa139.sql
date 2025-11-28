-- Allow users to view their own role assignments
-- This is needed for the useUserRole hook to work for regular users
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);