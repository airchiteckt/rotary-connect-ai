-- Add profession and awards fields to members table
ALTER TABLE members 
ADD COLUMN profession text,
ADD COLUMN awards text;

-- Create function to auto-create member record when invite is accepted
CREATE OR REPLACE FUNCTION auto_create_member_from_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if invite was just accepted
  IF NEW.status = 'accepted' AND OLD.status = 'pending' AND NEW.accepted_by_user_id IS NOT NULL THEN
    -- Create member record
    INSERT INTO members (
      user_id,
      first_name,
      last_name,
      email,
      membership_start_date,
      status
    )
    VALUES (
      NEW.user_id, -- club owner
      NEW.first_name,
      NEW.last_name,
      NEW.email,
      CURRENT_DATE,
      'active'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create member
DROP TRIGGER IF EXISTS trigger_auto_create_member_from_invite ON club_invites;
CREATE TRIGGER trigger_auto_create_member_from_invite
  AFTER UPDATE ON club_invites
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_member_from_invite();