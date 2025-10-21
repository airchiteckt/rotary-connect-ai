-- Fix RLS policies for club_invites table
-- Drop the problematic policy that references auth.users
DROP POLICY IF EXISTS "Users can view invites for their email" ON public.club_invites;

-- Keep only the admin policy for viewing invites
-- Users can manage their own club invites policy already exists and is correct