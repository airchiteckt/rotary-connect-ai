-- Function to get the club owner ID for any user
CREATE OR REPLACE FUNCTION public.get_club_owner_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  owner_id uuid;
BEGIN
  -- Check if user is a club owner (has admin role in profiles)
  SELECT user_id INTO owner_id
  FROM public.profiles
  WHERE user_id = user_uuid AND role = 'admin';
  
  IF owner_id IS NOT NULL THEN
    RETURN owner_id;
  END IF;
  
  -- Otherwise, get the club owner from club_members
  SELECT club_owner_id INTO owner_id
  FROM public.club_members
  WHERE user_id = user_uuid AND status = 'active'
  LIMIT 1;
  
  RETURN owner_id;
END;
$function$;

-- Update is_trial_valid to check club owner's subscription
CREATE OR REPLACE FUNCTION public.is_trial_valid(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  profile_rec RECORD;
  total_trial_period INTERVAL;
  owner_id uuid;
BEGIN
  -- Get the club owner ID
  owner_id := public.get_club_owner_id(user_uuid);
  
  IF owner_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the club owner's profile
  SELECT * INTO profile_rec 
  FROM public.profiles 
  WHERE user_id = owner_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If account is manually suspended
  IF profile_rec.account_status = 'suspended' THEN
    RETURN FALSE;
  END IF;
  
  -- If subscription is active, return true
  IF profile_rec.subscription_type = 'active' THEN
    RETURN TRUE;
  END IF;
  
  -- Calculate total trial period (4 months + bonus months)
  total_trial_period := INTERVAL '4 months' + (profile_rec.bonus_months || ' months')::INTERVAL;
  
  -- If trial period has expired, return false
  IF profile_rec.subscription_type = 'trial' AND 
     profile_rec.trial_start_date < (now() - total_trial_period) THEN
    -- Update subscription status to expired and suspend account
    UPDATE public.profiles 
    SET subscription_type = 'expired',
        account_status = 'suspended'
    WHERE user_id = owner_id;
    RETURN FALSE;
  END IF;
  
  -- Trial is still valid
  RETURN TRUE;
END;
$function$;

-- Update handle_new_user to only set trial for club creators
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
    );
  ELSE
    -- This is an invited user, no trial needed
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'member'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update accept_club_invite to not touch subscription fields
CREATE OR REPLACE FUNCTION public.accept_club_invite(invite_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
  
  -- Find the invite
  SELECT * INTO invite_record 
  FROM public.club_invites 
  WHERE invite_token = invite_token_param 
    AND status = 'pending' 
    AND expires_at > now()
    AND email = current_user_email;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Add user to club members
  INSERT INTO public.club_members (club_owner_id, user_id, role)
  VALUES (invite_record.user_id, current_user_id, 'member')
  ON CONFLICT (club_owner_id, user_id) DO NOTHING;
  
  -- Mark invite as accepted
  UPDATE public.club_invites 
  SET status = 'accepted', updated_at = now()
  WHERE id = invite_record.id;
  
  -- Update user profile with basic info only (no subscription fields)
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(NULLIF(full_name, ''), invite_record.first_name || ' ' || invite_record.last_name),
    role = 'member',
    updated_at = now()
  WHERE user_id = current_user_id 
    AND (full_name IS NULL OR full_name = '');
  
  RETURN TRUE;
END;
$function$;