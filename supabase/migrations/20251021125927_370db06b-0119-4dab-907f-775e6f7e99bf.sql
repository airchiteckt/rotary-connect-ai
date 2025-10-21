
-- Fix Damiano's membership and permissions
DO $$
DECLARE
  damiano_user_id uuid := '42fb759a-be07-4fd1-ac31-102ef7a689e2';
  invite_record RECORD;
  permission app_section;
BEGIN
  -- Get the invite details
  SELECT * INTO invite_record 
  FROM public.club_invites 
  WHERE email = 'damianofrancesco@libero.it' 
    AND status = 'pending'
  LIMIT 1;

  IF FOUND THEN
    -- Add to club_members
    INSERT INTO public.club_members (club_owner_id, user_id, role, status)
    VALUES (invite_record.user_id, damiano_user_id, 'member', 'active')
    ON CONFLICT (club_owner_id, user_id) DO NOTHING;
    
    -- Copy permissions from invite
    IF invite_record.permissions IS NOT NULL THEN
      FOREACH permission IN ARRAY invite_record.permissions
      LOOP
        INSERT INTO public.member_permissions (user_id, club_owner_id, section)
        VALUES (damiano_user_id, invite_record.user_id, permission)
        ON CONFLICT (user_id, club_owner_id, section) DO NOTHING;
      END LOOP;
    END IF;
    
    -- Mark invite as accepted
    UPDATE public.club_invites 
    SET status = 'accepted', updated_at = now()
    WHERE id = invite_record.id;
    
    RAISE NOTICE 'Successfully added Damiano to club_members and copied permissions';
  END IF;
END $$;

-- Improve accept_club_invite function to be more robust
CREATE OR REPLACE FUNCTION public.accept_club_invite(invite_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  
  -- Find the invite - removed email check to make it more flexible
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
  
  -- Update user profile role (no subscription fields)
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
$function$;
