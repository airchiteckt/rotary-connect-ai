-- Fix the problematic RLS policy that directly accesses auth.users
DROP POLICY IF EXISTS "Users can view their pending invites by email" ON club_invites;

-- Create a new policy using the SECURITY DEFINER function
CREATE POLICY "Users can view their pending invites by email" 
ON club_invites 
FOR SELECT 
TO authenticated
USING (
  status = 'pending' 
  AND email = public.get_user_email(auth.uid())
);