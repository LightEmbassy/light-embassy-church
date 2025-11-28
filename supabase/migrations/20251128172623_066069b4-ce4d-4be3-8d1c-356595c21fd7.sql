-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
DROP TRIGGER IF EXISTS update_prayer_requests_updated_at ON public.prayer_requests;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
DROP TRIGGER IF EXISTS update_favorite_verses_updated_at ON public.favorite_verses;
DROP TRIGGER IF EXISTS update_conversation_last_message ON public.messages;
DROP TRIGGER IF EXISTS create_message_notification_trigger ON public.messages;

-- Drop all tables (in order to respect foreign key constraints)
DROP TABLE IF EXISTS public.message_notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.prayer_interactions CASCADE;
DROP TABLE IF EXISTS public.prayer_requests CASCADE;
DROP TABLE IF EXISTS public.user_quiz_responses CASCADE;
DROP TABLE IF EXISTS public.user_quiz_completion CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.favorite_verses CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_staff(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS public.create_message_notification() CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.prayer_category CASCADE;
DROP TYPE IF EXISTS public.message_status CASCADE;
DROP TYPE IF EXISTS public.conversation_status CASCADE;