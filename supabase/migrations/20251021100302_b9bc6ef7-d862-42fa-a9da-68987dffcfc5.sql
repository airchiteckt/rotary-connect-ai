-- Update the is_trial_valid function to use 4 months (120 days) trial period
CREATE OR REPLACE FUNCTION public.is_trial_valid(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Calculate total trial period (4 months + bonus months)
  total_trial_period := INTERVAL '4 months' + (profile_rec.bonus_months || ' months')::INTERVAL;
  
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
$function$;