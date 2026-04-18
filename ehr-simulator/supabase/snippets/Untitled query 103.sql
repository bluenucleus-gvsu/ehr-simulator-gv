SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'documentation_results'  
          -- AND column_name like '%urine%'

UPDATE editable_documentation_results 
SET time_offset = time_offset * -1
WHERE time_offset < 0;

UPDATE documentation_results
SET time_offset = time_offset * -1
WHERE time_offset > 0;

UPDATE clinical_documents
SET time_offset = time_offset * -1
WHERE time_offset > 0;

UPDATE editable_clinical_documents
SET time_offset = time_offset * -1
WHERE time_offset < 0;

UPDATE lab_results
SET time_offset = time_offset * -1
WHERE time_offset > 0;

UPDATE documentation_results 
  SET urine_description = urine_output_ml, 
    urine_output_ml = null
  WHERE urine_output_ml = 'concentrated';

UPDATE documentation_results
  SET stool_occurrence = stool_output_ml,
    stool_output_ml = null
  WHERE stool_output_ml IS NOT NULL;
