-- Fix remaining SECURITY DEFINER functions with proper search_path
-- Only updating the ones that need fixing

-- Fix accept_club_invite with qualified type names
CREATE OR REPLACE FUNCTION public.accept_club_invite(invite_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  permission public.app_section;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Find the invite
  SELECT * INTO invite_record 
  FROM club_invites 
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
  PERFORM auto_confirm_invited_user(current_user_id);
  
  -- Add user to club members
  INSERT INTO club_members (club_owner_id, user_id, role, status)
  VALUES (invite_record.user_id, current_user_id, 'member', 'active')
  ON CONFLICT (club_owner_id, user_id) DO UPDATE 
  SET status = 'active', updated_at = now();
  
  -- Copy permissions from invite to member_permissions with responsible status
  IF invite_record.permissions IS NOT NULL THEN
    FOREACH permission IN ARRAY invite_record.permissions
    LOOP
      INSERT INTO member_permissions (user_id, club_owner_id, section, is_responsible)
      VALUES (
        current_user_id, 
        invite_record.user_id, 
        permission,
        CASE 
          WHEN invite_record.responsible_sections IS NOT NULL 
            AND permission = ANY(invite_record.responsible_sections) 
          THEN true 
          ELSE false 
        END
      )
      ON CONFLICT (user_id, club_owner_id, section) DO UPDATE
      SET is_responsible = EXCLUDED.is_responsible;
    END LOOP;
  END IF;
  
  -- Mark invite as accepted and link to the user who accepted it
  UPDATE club_invites 
  SET 
    status = 'accepted', 
    accepted_by_user_id = current_user_id,
    updated_at = now()
  WHERE id = invite_record.id;
  
  -- Create or update user profile
  INSERT INTO profiles (user_id, full_name, role)
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
$$;

-- Fix auto_confirm_invited_user with proper search_path
CREATE OR REPLACE FUNCTION public.auto_confirm_invited_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user in auth.users to confirm their email
  UPDATE auth.users
  SET 
    email_confirmed_at = now(),
    confirmed_at = now()
  WHERE id = user_uuid
    AND email_confirmed_at IS NULL;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error auto-confirming user email: %', SQLERRM;
    RETURN FALSE;
END;
$$;