-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can manage club invites" ON public.club_invites;
DROP POLICY IF EXISTS "Users can view invites sent to their email" ON public.club_invites;

-- Create new, correct policies for club_invites
CREATE POLICY "Users can manage their own club invites" 
ON public.club_invites 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to view invites sent to their email for registration
CREATE POLICY "Users can view invites for their email" 
ON public.club_invites 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = club_invites.email
  )
);