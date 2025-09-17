-- Create enum for available sections
CREATE TYPE public.app_section AS ENUM (
  'dashboard',
  'segreteria', 
  'tesoreria',
  'presidenza',
  'prefettura', 
  'direttivo',
  'comunicazione',
  'soci',
  'commissioni',
  'organigramma'
);

-- Create member permissions table
CREATE TABLE public.member_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section public.app_section NOT NULL,
  club_owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section, club_owner_id)
);

-- Enable RLS
ALTER TABLE public.member_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Only admins can manage member permissions"
ON public.member_permissions
FOR ALL
USING (
  is_current_user_admin() AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_id = member_permissions.club_owner_id
  )
);

CREATE POLICY "Users can view their own permissions"
ON public.member_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Add permissions column to club_invites table
ALTER TABLE public.club_invites 
ADD COLUMN permissions public.app_section[] DEFAULT ARRAY[]::public.app_section[];

-- Create function to check if user has permission for a section
CREATE OR REPLACE FUNCTION public.user_has_section_permission(user_uuid uuid, section_name text, club_owner_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- Admin always has access to everything
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has specific permission for the section
  RETURN EXISTS (
    SELECT 1 
    FROM public.member_permissions 
    WHERE user_id = user_uuid 
      AND section = section_name::public.app_section
      AND club_owner_id = club_owner_uuid
  );
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_member_permissions_updated_at
BEFORE UPDATE ON public.member_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();