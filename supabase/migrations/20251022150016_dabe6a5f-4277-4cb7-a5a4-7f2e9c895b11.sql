-- Allow public read access to club profiles for public pages
CREATE POLICY "Public can view club profiles with slug"
ON public.profiles
FOR SELECT
USING (club_slug IS NOT NULL);

-- Also update the existing auth users policy to not conflict
DROP POLICY IF EXISTS "Authenticated users can view basic club owner info" ON public.profiles;

CREATE POLICY "Authenticated users can view other club profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND club_slug IS NOT NULL 
  AND user_id <> auth.uid()
);