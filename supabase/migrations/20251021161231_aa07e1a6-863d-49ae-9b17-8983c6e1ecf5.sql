-- Add accepted_by_user_id to track which user accepted the invite
ALTER TABLE club_invites 
ADD COLUMN IF NOT EXISTS accepted_by_user_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_club_invites_accepted_by_user_id 
ON club_invites(accepted_by_user_id);

-- Update existing accepted invites to link them with club_members
-- This matches accepted invites with club members based on the club owner
UPDATE club_invites ci
SET accepted_by_user_id = cm.user_id
FROM club_members cm
WHERE ci.status = 'accepted' 
  AND ci.user_id = cm.club_owner_id
  AND ci.accepted_by_user_id IS NULL
  AND lower(ci.first_name || ' ' || ci.last_name) = lower((
    SELECT full_name 
    FROM profiles 
    WHERE user_id = cm.user_id
  ));

-- Create a function to get user emails (using security definer to bypass RLS)
CREATE OR REPLACE FUNCTION get_user_email(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  RETURN user_email;
END;
$$;