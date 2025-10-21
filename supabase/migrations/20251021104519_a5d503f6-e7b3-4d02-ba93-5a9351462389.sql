
-- Update accept_club_invite to copy permissions from invite
CREATE OR REPLACE FUNCTION public.accept_club_invite(invite_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  current_user_email TEXT;
  permission app_section;
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
  
  -- Copy permissions from invite to member_permissions
  IF invite_record.permissions IS NOT NULL THEN
    FOREACH permission IN ARRAY invite_record.permissions
    LOOP
      INSERT INTO public.member_permissions (user_id, club_owner_id, section)
      VALUES (current_user_id, invite_record.user_id, permission)
      ON CONFLICT (user_id, club_owner_id, section) DO NOTHING;
    END LOOP;
  END IF;
  
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
