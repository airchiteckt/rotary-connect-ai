-- Update the accept_club_invite function to set accepted_by_user_id
CREATE OR REPLACE FUNCTION public.accept_club_invite(invite_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  permission app_section;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Find the invite
  SELECT * INTO invite_record 
  FROM public.club_invites 
  WHERE invite_token = invite_token_param 
    AND status = 'pending' 
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE WARNING 'Invite not found or expired: %', invite_token_param;
    RETURN FALSE;
  END IF;
  
  -- Log for debugging
  RAISE NOTICE 'Processing invite for user % with email %', current_user_id, invite_record.email;
  
  -- Auto-confirm email for invited user
  PERFORM public.auto_confirm_invited_user(current_user_id);
  
  -- Add user to club members
  INSERT INTO public.club_members (club_owner_id, user_id, role, status)
  VALUES (invite_record.user_id, current_user_id, 'member', 'active')
  ON CONFLICT (club_owner_id, user_id) DO UPDATE 
  SET status = 'active', updated_at = now();
  
  -- Copy permissions from invite to member_permissions
  IF invite_record.permissions IS NOT NULL THEN
    FOREACH permission IN ARRAY invite_record.permissions
    LOOP
      INSERT INTO public.member_permissions (user_id, club_owner_id, section)
      VALUES (current_user_id, invite_record.user_id, permission)
      ON CONFLICT (user_id, club_owner_id, section) DO NOTHING;
    END LOOP;
  END IF;
  
  -- Mark invite as accepted and link to the user who accepted it
  UPDATE public.club_invites 
  SET 
    status = 'accepted', 
    accepted_by_user_id = current_user_id,
    updated_at = now()
  WHERE id = invite_record.id;
  
  -- Create or update user profile
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    current_user_id,
    invite_record.first_name || ' ' || invite_record.last_name,
    'member'
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET 
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
    role = 'member',
    updated_at = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in accept_club_invite: %', SQLERRM;
    RETURN FALSE;
END;
$function$;