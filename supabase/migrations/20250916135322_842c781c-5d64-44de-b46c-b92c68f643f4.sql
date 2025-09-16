-- Fix security issues by setting proper search paths on functions
ALTER FUNCTION public.generate_invite_token() SET search_path = public;
ALTER FUNCTION public.set_invite_token() SET search_path = public;