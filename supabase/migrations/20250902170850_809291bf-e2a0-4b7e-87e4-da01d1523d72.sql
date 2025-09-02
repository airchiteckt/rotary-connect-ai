-- Verifica la struttura della tabella documents
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND table_schema = 'public';

-- Verifica tutti i constraint della tabella documents
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    cc.check_clause
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name 
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.check_constraints AS cc 
    ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'documents' 
AND tc.table_schema = 'public';