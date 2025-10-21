-- Fix security issue: Restrict access to members table
-- Remove the public read policy that exposes member emails
DROP POLICY IF EXISTS "Allow public read access to members for public pages" ON members;

-- Allow club owners to view all their members
CREATE POLICY "Club owners can view their members" 
ON members 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow club members to view other members in their club
CREATE POLICY "Club members can view other club members" 
ON members 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM club_members 
    WHERE club_members.user_id = auth.uid() 
      AND club_members.club_owner_id = members.user_id 
      AND club_members.status = 'active'
  )
);

-- Keep the other policies for managing members (insert, update, delete)
-- They already have proper RLS through the existing policy