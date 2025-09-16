-- Update the handle_new_user function to set admin role for club creators
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, club_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'club_name', ''),
    'admin'  -- New users who create clubs are automatically admins
  );
  RETURN NEW;
END;
$$;

-- Add a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  RETURN user_role = 'admin';
END;
$$;

-- Add a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$$;

-- Update club_invites policies to only allow admins to create invites
DROP POLICY IF EXISTS "Club owners can manage their invites" ON public.club_invites;

CREATE POLICY "Only admins can manage club invites" 
ON public.club_invites 
FOR ALL
USING (
  auth.uid() = user_id AND public.is_current_user_admin()
);

-- Update club_members policies to only allow admins to manage members
DROP POLICY IF EXISTS "Club owners can manage their members" ON public.club_members;

CREATE POLICY "Only admins can manage club members" 
ON public.club_members 
FOR ALL
USING (
  public.is_current_user_admin() AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND user_id = club_members.club_owner_id
  )
);

-- Add role options to profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT check_valid_role 
CHECK (role IN ('admin', 'member', 'treasurer'));