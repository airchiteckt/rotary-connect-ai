-- Add header_text field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN header_text text;