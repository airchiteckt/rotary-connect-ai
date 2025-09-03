-- Add location, secretary and president fields to user profiles
ALTER TABLE public.profiles 
ADD COLUMN default_location TEXT,
ADD COLUMN secretary_name TEXT,
ADD COLUMN president_name TEXT;