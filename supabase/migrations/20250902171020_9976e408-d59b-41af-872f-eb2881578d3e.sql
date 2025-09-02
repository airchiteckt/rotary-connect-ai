-- Rimuovi il constraint esistente sui tipi di documento se esiste
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'documents_type_check'
    ) THEN
        ALTER TABLE public.documents DROP CONSTRAINT documents_type_check;
    END IF;
END $$;

-- Aggiungi il constraint corretto per i tipi di documento
ALTER TABLE public.documents 
ADD CONSTRAINT documents_type_check 
CHECK (type IN ('verbali', 'programmi', 'comunicazioni', 'circolari'));