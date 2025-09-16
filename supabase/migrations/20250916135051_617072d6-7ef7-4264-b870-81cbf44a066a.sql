-- Create club invites table for managing member invitations
CREATE TABLE public.club_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- The president/admin who sent the invite
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  invite_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club members table to track all club members
CREATE TABLE public.club_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_owner_id UUID NOT NULL, -- The president/owner of the club
  user_id UUID NOT NULL, -- The actual user who joined
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_owner_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.club_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- Create policies for club_invites
CREATE POLICY "Club owners can manage their invites" 
ON public.club_invites 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view invites sent to their email" 
ON public.club_invites 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = club_invites.email
  )
);

-- Create policies for club_members  
CREATE POLICY "Club owners can manage their members" 
ON public.club_members 
FOR ALL 
USING (auth.uid() = club_owner_id);

CREATE POLICY "Users can view their own membership" 
ON public.club_members 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to generate invite tokens
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Add trigger to auto-generate invite tokens
CREATE OR REPLACE FUNCTION public.set_invite_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invite_token IS NULL THEN
    NEW.invite_token := generate_invite_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invite_token_trigger
  BEFORE INSERT ON public.club_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invite_token();

-- Add updated_at triggers
CREATE TRIGGER update_club_invites_updated_at
  BEFORE UPDATE ON public.club_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_club_members_updated_at
  BEFORE UPDATE ON public.club_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to accept an invite
CREATE OR REPLACE FUNCTION public.accept_club_invite(invite_token_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
  
  -- Find the invite
  SELECT * INTO invite_record 
  FROM public.club_invites 
  WHERE invite_token = invite_token_param 
    AND status = 'pending' 
    AND expires_at > now()
    AND email = current_user_email;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Add user to club members
  INSERT INTO public.club_members (club_owner_id, user_id, role)
  VALUES (invite_record.user_id, current_user_id, invite_record.role)
  ON CONFLICT (club_owner_id, user_id) DO NOTHING;
  
  -- Mark invite as accepted
  UPDATE public.club_invites 
  SET status = 'accepted', updated_at = now()
  WHERE id = invite_record.id;
  
  -- Update user profile with club info if they don't have it
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(NULLIF(full_name, ''), invite_record.first_name || ' ' || invite_record.last_name),
    updated_at = now()
  WHERE user_id = current_user_id 
    AND (full_name IS NULL OR full_name = '');
  
  RETURN TRUE;
END;
$$;

-- Function to get member count for a club owner
CREATE OR REPLACE FUNCTION public.get_club_member_count(club_owner_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO member_count  -- +1 for the owner
  FROM public.club_members 
  WHERE club_owner_id = club_owner_uuid 
    AND status = 'active';
  
  RETURN member_count;
END;
$$;

-- Function to calculate monthly price based on member count
CREATE OR REPLACE FUNCTION public.calculate_club_price(member_count INTEGER)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
  IF member_count <= 20 THEN
    RETURN 15.00;
  ELSIF member_count <= 30 THEN
    RETURN 25.00;
  ELSIF member_count <= 50 THEN
    RETURN 35.00;
  ELSE
    RETURN 50.00;
  END IF;
END;
$$;