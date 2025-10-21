-- Create function to auto-confirm email for invited users
CREATE OR REPLACE FUNCTION public.auto_confirm_invited_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Update accept_club_invite to auto-confirm email
CREATE OR REPLACE FUNCTION public.accept_club_invite(invite_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  
  -- Mark invite as accepted
  UPDATE public.club_invites 
  SET status = 'accepted', updated_at = now()
  WHERE id = invite_record.id;
  
  -- Update user profile role
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(NULLIF(full_name, ''), invite_record.first_name || ' ' || invite_record.last_name),
    role = 'member',
    updated_at = now()
  WHERE user_id = current_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in accept_club_invite: %', SQLERRM;
    RETURN FALSE;
END;
$$;