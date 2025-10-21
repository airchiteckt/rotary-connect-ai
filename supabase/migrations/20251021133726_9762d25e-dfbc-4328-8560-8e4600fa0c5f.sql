-- Create missing profiles for existing club members
INSERT INTO public.profiles (user_id, full_name, role)
VALUES 
  ('42fb759a-be07-4fd1-ac31-102ef7a689e2', 'Damiano Francesco', 'member'),
  ('55f30020-e7e9-4bb2-83fe-7041fe83f549', 'Stanislao Prova', 'member')
ON CONFLICT (user_id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  role = 'member',
  updated_at = now();