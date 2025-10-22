-- Fix auto_confirm_invited_user to not update generated column confirmed_at
DROP FUNCTION IF EXISTS public.auto_confirm_invited_user(uuid);

CREATE OR REPLACE FUNCTION public.auto_confirm_invited_user(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the user in auth.users to confirm their email
  -- Don't update confirmed_at as it's a generated column
  UPDATE auth.users
  SET 
    email_confirmed_at = now()
  WHERE id = user_uuid
    AND email_confirmed_at IS NULL;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error auto-confirming user email: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Also fix the trigger version
DROP FUNCTION IF EXISTS public.auto_confirm_invited_user() CASCADE;

CREATE OR REPLACE FUNCTION public.auto_confirm_invited_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pending_invite RECORD;
BEGIN
  -- Check if there's a pending invite for this email
  SELECT * INTO pending_invite
  FROM club_invites
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  LIMIT 1;

  -- If there's a pending invite, auto-confirm the email
  IF pending_invite.id IS NOT NULL THEN
    -- Update the user's email_confirmed_at in auth.users
    -- Don't update confirmed_at as it's a generated column
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id
      AND email_confirmed_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;