-- Fix the remaining function search path issue
ALTER FUNCTION public.handle_new_user() SET search_path = public;