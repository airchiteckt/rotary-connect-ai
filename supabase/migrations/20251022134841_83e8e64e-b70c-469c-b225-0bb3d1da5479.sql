-- Fix handle_new_user trigger to avoid conflicts with invited users
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  generated_slug text;
  club_name_value text;
BEGIN
  -- Get club name from metadata
  club_name_value := COALESCE(NEW.raw_user_meta_data->>'club_name', '');
  
  -- Generate slug from club name
  generated_slug := public.generate_club_slug(club_name_value);
  
  -- Only create new club owner with trial if club_name is provided
  IF club_name_value != '' THEN
    -- This is a new club owner
    INSERT INTO public.profiles (user_id, full_name, club_name, club_slug, role, subscription_type, trial_start_date)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      club_name_value,
      generated_slug,
      'admin',
      'trial',
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- This is an invited user - create basic profile
    -- accept_club_invite will update it later with proper data
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'member'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();