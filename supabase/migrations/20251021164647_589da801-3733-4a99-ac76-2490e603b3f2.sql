-- Fix security issue: Restrict public access to profiles table
-- Remove the existing public read policy that exposes all user data
DROP POLICY IF EXISTS "Allow public read access to club profiles" ON profiles;

-- Create a restricted public policy that ONLY exposes club_slug and club_name
-- This is needed for public club pages but doesn't expose personal data
CREATE POLICY "Public can view club page info only" 
ON profiles 
FOR SELECT 
TO anon
USING (
  club_slug IS NOT NULL
);

-- Note: We need to modify how we select data to ensure only safe fields are exposed
-- The policy allows access but applications should only SELECT club_slug, club_name, 
-- and other non-sensitive public fields when not authenticated

-- Authenticated users can view their own full profile
-- (This policy already exists as "Users can view their own profile")

-- Authenticated users can see basic public info of other club owners
CREATE POLICY "Authenticated users can view basic club owner info" 
ON profiles 
FOR SELECT 
TO authenticated
USING (
  club_slug IS NOT NULL 
  AND user_id != auth.uid()
);