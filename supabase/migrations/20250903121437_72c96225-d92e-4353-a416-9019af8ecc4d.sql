-- Add backgroundTemplate column to documents table
ALTER TABLE public.documents 
ADD COLUMN background_template TEXT DEFAULT 'classic';

-- Add comment to describe the column
COMMENT ON COLUMN public.documents.background_template IS 'Background template style for document rendering (classic, modern, elegant, minimal)';