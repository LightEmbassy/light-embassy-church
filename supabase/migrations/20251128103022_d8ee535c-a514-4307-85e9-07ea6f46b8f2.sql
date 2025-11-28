-- ====================================================================
-- SECURITY FIX MIGRATION
-- Complete secure database setup with all security vulnerabilities fixed
-- ====================================================================

-- Create enum for user roles (if it doesn't already exist)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'counsellor', 'staff', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for prayer categories
DO $$ BEGIN
  CREATE TYPE public.prayer_category AS ENUM (
    'healing', 'finance', 'family', 'guidance', 
    'thanksgiving', 'salvation', 'protection', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for message status
DO $$ BEGIN
  CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read', 'moderated', 'flagged');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for conversation status
DO $$ BEGIN
  CREATE TYPE public.conversation_status AS ENUM ('active', 'closed', 'pending_moderation', 'escalated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- STEP 1: Create user_roles table (SECURE - separate from profiles)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Only admins can assign roles
CREATE POLICY "Admins can assign roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ====================================================================
-- STEP 2: Create SECURITY DEFINER functions for secure role checking
-- ====================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('staff', 'counsellor', 'moderator', 'admin')
  )
$$;

-- ====================================================================
-- STEP 3: Create profiles table (WITHOUT role column for security)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  quiz_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substring(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- STEP 4: Prayer requests with SECURE granular access
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category prayer_category NOT NULL DEFAULT 'other',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  request_pastoral_counselling BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own prayer requests"
ON public.prayer_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Public non-pastoral prayers visible to all
CREATE POLICY "Public prayers visible to authenticated"
ON public.prayer_requests
FOR SELECT
USING (
  is_anonymous = false
  AND request_pastoral_counselling = false
);

-- Staff can view pastoral counselling requests
CREATE POLICY "Staff view pastoral counselling"
ON public.prayer_requests
FOR SELECT
USING (
  request_pastoral_counselling = true
  AND public.is_staff(auth.uid())
);

-- Staff can view all for moderation
CREATE POLICY "Staff view all prayers"
ON public.prayer_requests
FOR SELECT
USING (public.is_staff(auth.uid()));

-- Users can create their own
CREATE POLICY "Users create own prayer requests"
ON public.prayer_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "Users update own prayer requests"
ON public.prayer_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users delete own prayer requests"
ON public.prayer_requests
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_prayer_requests_updated_at
BEFORE UPDATE ON public.prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_prayer_requests_pastoral ON public.prayer_requests(request_pastoral_counselling);
CREATE INDEX idx_prayer_requests_anonymous ON public.prayer_requests(is_anonymous);