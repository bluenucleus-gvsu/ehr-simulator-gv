SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_catalog.pg_get_constraintdef(con.oid) AS constraint_definition
FROM 
    pg_catalog.pg_constraint con
INNER JOIN 
    pg_catalog.pg_class rel ON rel.oid = con.conrelid
INNER JOIN 
    pg_catalog.pg_namespace nsp ON nsp.oid = con.connamespace
WHERE 
    rel.relname = 'lab_results';