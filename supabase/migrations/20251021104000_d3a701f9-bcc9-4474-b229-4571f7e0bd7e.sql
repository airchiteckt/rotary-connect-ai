
-- Fix stanislao's profile and associate to the correct club
DO $$
DECLARE
  club_owner_uuid uuid;
  stanislao_uuid uuid := '55f30020-e7e9-4bb2-83fe-7041fe83f549';
BEGIN
  -- Get club owner ID from invite
  SELECT user_id INTO club_owner_uuid
  FROM public.club_invites
  WHERE email = 'stanislao@abbattitorizapper.it'
  LIMIT 1;

  -- Update stanislao's profile to be a member (no club_name, no subscription)
  UPDATE public.profiles
  SET 
    role = 'member',
    club_name = NULL,
    club_slug = NULL,
    subscription_type = NULL,
    account_status = 'active',
    updated_at = now()
  WHERE user_id = stanislao_uuid;

  -- Add to club_members
  INSERT INTO public.club_members (club_owner_id, user_id, role, status)
  VALUES (club_owner_uuid, stanislao_uuid, 'member', 'active')
  ON CONFLICT (club_owner_id, user_id) DO UPDATE
  SET role = 'member', status = 'active', updated_at = now();

  -- Mark invite as accepted
  UPDATE public.club_invites
  SET status = 'accepted', updated_at = now()
  WHERE email = 'stanislao@abbattitorizapper.it';

  RAISE NOTICE 'Fixed stanislao profile and club membership';
END $$;
