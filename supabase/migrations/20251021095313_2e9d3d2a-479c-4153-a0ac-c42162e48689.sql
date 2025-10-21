-- Allow unauthenticated users to view invites by token
-- This is necessary for the club invite page to work
CREATE POLICY "Anyone can view invites by token" 
ON public.club_invites 
FOR SELECT 
USING (invite_token IS NOT NULL);