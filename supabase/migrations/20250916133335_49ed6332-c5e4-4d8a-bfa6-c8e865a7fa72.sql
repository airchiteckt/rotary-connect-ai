-- Add referral system fields to profiles table
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN referral_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN bonus_months INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN account_status TEXT DEFAULT 'active';

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_uuid uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character code using club name initials + random numbers
    SELECT UPPER(
      COALESCE(
        SUBSTRING(REGEXP_REPLACE(club_name, '[^A-Za-z ]', '', 'g') FROM 1 FOR 3),
        'ROT'
      ) || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0')
    ) INTO code
    FROM public.profiles 
    WHERE user_id = user_uuid;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Update existing profiles to have referral codes
UPDATE public.profiles 
SET referral_code = public.generate_referral_code(user_id)
WHERE referral_code IS NULL;

-- Create function to handle referral signup
CREATE OR REPLACE FUNCTION public.handle_referral_signup(new_user_id uuid, referral_code_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  referrer_id uuid;
  referrer_count INTEGER;
BEGIN
  -- Find the referrer
  SELECT user_id, referral_count INTO referrer_id, referrer_count
  FROM public.profiles 
  WHERE referral_code = referral_code_input;
  
  -- If referrer exists and hasn't exceeded limit
  IF referrer_id IS NOT NULL AND referrer_count < 4 THEN
    -- Update new user with 3 bonus months
    UPDATE public.profiles 
    SET referred_by = referral_code_input,
        bonus_months = 3
    WHERE user_id = new_user_id;
    
    -- Update referrer with 3 bonus months and increment count
    UPDATE public.profiles 
    SET bonus_months = bonus_months + 3,
        referral_count = referral_count + 1
    WHERE user_id = referrer_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Update trial validation function to include bonus months
CREATE OR REPLACE FUNCTION public.is_trial_valid(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_rec RECORD;
  total_trial_period INTERVAL;
BEGIN
  SELECT * INTO profile_rec 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If account is manually suspended
  IF profile_rec.account_status = 'suspended' THEN
    RETURN FALSE;
  END IF;
  
  -- If subscription is active, return true
  IF profile_rec.subscription_type = 'active' THEN
    RETURN TRUE;
  END IF;
  
  -- Calculate total trial period (1 month + bonus months)
  total_trial_period := INTERVAL '1 month' + (profile_rec.bonus_months || ' months')::INTERVAL;
  
  -- If trial period has expired, return false
  IF profile_rec.subscription_type = 'trial' AND 
     profile_rec.trial_start_date < (now() - total_trial_period) THEN
    -- Update subscription status to expired and suspend account
    UPDATE public.profiles 
    SET subscription_type = 'expired',
        account_status = 'suspended'
    WHERE user_id = user_uuid;
    RETURN FALSE;
  END IF;
  
  -- Trial is still valid
  RETURN TRUE;
END;
$$;