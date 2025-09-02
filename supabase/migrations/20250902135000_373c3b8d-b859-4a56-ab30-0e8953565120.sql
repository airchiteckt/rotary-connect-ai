-- Fix security issues by setting proper search_path for functions

-- Update generate_document_number function with proper search_path
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT, user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  doc_count INTEGER;
  type_prefix TEXT;
  doc_number TEXT;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Set prefix based on document type
  CASE doc_type
    WHEN 'verbali' THEN type_prefix := 'VB';
    WHEN 'programmi' THEN type_prefix := 'PM';
    WHEN 'comunicazioni' THEN type_prefix := 'COM';
    WHEN 'circolari' THEN type_prefix := 'CIR';
    ELSE type_prefix := 'DOC';
  END CASE;
  
  -- Get count of documents of this type for this user in current year
  SELECT COUNT(*) + 1 INTO doc_count
  FROM public.documents 
  WHERE user_id = user_uuid 
    AND type = doc_type 
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Generate document number: PREFIX/YYYY/000
  doc_number := type_prefix || '/' || current_year || '/' || LPAD(doc_count::TEXT, 3, '0');
  
  RETURN doc_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update set_document_number function with proper search_path
CREATE OR REPLACE FUNCTION set_document_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_number IS NULL THEN
    NEW.document_number := generate_document_number(NEW.type, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;