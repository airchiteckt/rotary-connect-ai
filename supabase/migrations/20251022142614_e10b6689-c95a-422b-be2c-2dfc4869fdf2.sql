-- Add approved field to documents table
ALTER TABLE public.documents 
ADD COLUMN approved boolean NOT NULL DEFAULT false;