-- Add logo and footer settings to user profiles
ALTER TABLE public.profiles 
ADD COLUMN default_logo_url TEXT,
ADD COLUMN default_footer_data TEXT;