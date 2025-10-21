-- Add is_responsible column to member_permissions table
ALTER TABLE public.member_permissions 
ADD COLUMN is_responsible BOOLEAN NOT NULL DEFAULT false;

-- Create unique constraint to ensure only one responsible per section per club
CREATE UNIQUE INDEX unique_responsible_per_section 
ON public.member_permissions (club_owner_id, section) 
WHERE is_responsible = true;

-- Add comment
COMMENT ON COLUMN public.member_permissions.is_responsible IS 'Indicates if this user is the responsible for this section';