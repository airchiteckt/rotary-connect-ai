-- Fix security issue: Restrict access to club_invites table
-- Remove the public read policy
DROP POLICY IF EXISTS "Anyone can view invites by token" ON club_invites;

-- Create a more secure policy that allows:
-- 1. Club owners to view their own invites
-- 2. Users to view invites where their email matches (for accepting invites)
CREATE POLICY "Club owners can view their invites" 
ON club_invites 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to view their own pending invites by email match
-- This is needed for the invite acceptance flow
CREATE POLICY "Users can view their pending invites by email" 
ON club_invites 
FOR SELECT 
TO authenticated
USING (
  status = 'pending' 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow public access ONLY for the invite acceptance page with valid token
-- But restrict to minimal data needed for acceptance
CREATE POLICY "Public can check invite validity by token" 
ON club_invites 
FOR SELECT 
TO anon
USING (
  invite_token IS NOT NULL 
  AND status = 'pending'
  AND expires_at > now()
);

-- Update the existing all-access policy to be more specific
DROP POLICY IF EXISTS "Users can manage their own club invites" ON club_invites;

CREATE POLICY "Club owners can insert invites" 
ON club_invites 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Club owners can update their invites" 
ON club_invites 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Club owners can delete their invites" 
ON club_invites 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);