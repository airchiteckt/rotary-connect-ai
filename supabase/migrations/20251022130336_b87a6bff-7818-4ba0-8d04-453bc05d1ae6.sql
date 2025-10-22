-- Populate members table from accepted club invites
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  email,
  membership_start_date,
  status,
  responsible_sections,
  created_at,
  updated_at
)
SELECT 
  ci.user_id,  -- club owner
  ci.first_name,
  ci.last_name,
  ci.email,
  cm.joined_at::date,
  'active',
  COALESCE(ci.responsible_sections, ARRAY[]::app_section[]),
  cm.created_at,
  cm.updated_at
FROM club_invites ci
INNER JOIN club_members cm ON cm.user_id = ci.accepted_by_user_id
WHERE ci.status = 'accepted'
  AND ci.accepted_by_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM members m 
    WHERE m.email = ci.email AND m.user_id = ci.user_id
  );