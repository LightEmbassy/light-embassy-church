
-- 1. user_roles: restrict SELECT
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. user_achievements: remove self-insert; admins/service only via SECURITY DEFINER fn
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can create their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Insert own achievements" ON public.user_achievements;

-- 3. message_notifications: only the SECURITY DEFINER trigger (service_role) inserts
DROP POLICY IF EXISTS "System can create notifications" ON public.message_notifications;
CREATE POLICY "Only service role can insert notifications"
  ON public.message_notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 4. prayer_requests: prevent user_id spoofing on submit
DROP POLICY IF EXISTS "Anyone can submit prayer requests" ON public.prayer_requests;
CREATE POLICY "Anyone can submit prayer requests"
  ON public.prayer_requests FOR INSERT
  TO public
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );

-- 5. Revoke public EXECUTE on internal trigger/helper SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM anon, authenticated, PUBLIC;
-- has_role / is_staff are used inside RLS policies — leave executable.
-- check_and_award_achievements is intentionally called from the client RPC — leave executable.
