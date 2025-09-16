-- Update existing users to admin role (they created their clubs)
UPDATE public.profiles 
SET role = 'admin' 
WHERE role = 'member';

-- Add club_slug column for unique URLs
ALTER TABLE public.profiles 
ADD COLUMN club_slug text UNIQUE;

-- Function to generate slug from club name
CREATE OR REPLACE FUNCTION public.generate_club_slug(club_name_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
  exists_check boolean;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(trim(club_name_input), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g'); -- Remove leading/trailing hyphens
  
  -- Start with base slug
  final_slug := base_slug;
  
  -- Check if slug exists, if so add counter
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE club_slug = final_slug) INTO exists_check;
    
    IF NOT exists_check THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Update existing profiles with slugs
UPDATE public.profiles 
SET club_slug = public.generate_club_slug(club_name) 
WHERE club_slug IS NULL AND club_name IS NOT NULL AND club_name != '';

-- Update the handle_new_user function to also generate slug
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  generated_slug text;
BEGIN
  -- Generate slug from club name
  generated_slug := public.generate_club_slug(COALESCE(NEW.raw_user_meta_data->>'club_name', ''));
  
  INSERT INTO public.profiles (user_id, full_name, club_name, club_slug, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'club_name', ''),
    generated_slug,
    'admin'  -- New users who create clubs are automatically admins
  );
  RETURN NEW;
END;
$$;