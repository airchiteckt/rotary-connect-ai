-- Drop the old constraint
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;

-- Add new constraint with the correct values
ALTER TABLE public.documents ADD CONSTRAINT documents_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text, 'completed'::text, 'sent'::text]));