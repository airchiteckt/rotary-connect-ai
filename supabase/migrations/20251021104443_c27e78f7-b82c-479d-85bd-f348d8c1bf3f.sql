
-- Copy permissions from invite to member_permissions for stanislao
INSERT INTO public.member_permissions (user_id, club_owner_id, section)
VALUES 
  ('55f30020-e7e9-4bb2-83fe-7041fe83f549', 'dae1e995-43d1-4e8a-bb18-5700d6b6836a', 'tesoreria'),
  ('55f30020-e7e9-4bb2-83fe-7041fe83f549', 'dae1e995-43d1-4e8a-bb18-5700d6b6836a', 'prefettura'),
  ('55f30020-e7e9-4bb2-83fe-7041fe83f549', 'dae1e995-43d1-4e8a-bb18-5700d6b6836a', 'comunicazione'),
  ('55f30020-e7e9-4bb2-83fe-7041fe83f549', 'dae1e995-43d1-4e8a-bb18-5700d6b6836a', 'commissioni')
ON CONFLICT (user_id, club_owner_id, section) DO NOTHING;
