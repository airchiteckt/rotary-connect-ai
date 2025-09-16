-- Fix the final function search path issue
ALTER FUNCTION public.calculate_club_price(integer) SET search_path = public;