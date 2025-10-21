-- Function to auto-confirm email for invited users
CREATE OR REPLACE FUNCTION auto_confirm_invited_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    UPDATE auth.users
    SET email_confirmed_at = NOW(),
        confirmed_at = NOW()
    WHERE id = NEW.id
      AND email_confirmed_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-confirm email for invited users
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_invited_user();