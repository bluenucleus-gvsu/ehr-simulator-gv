INSERT INTO documentation_results (case_id, time_offset, general_appearance_selections, assessment_tool_selections) VALUES 
  ('e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', -10, 'Safety Checks', 'CIWA-Ar'),
  ('e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', -20, NULL, 'PAINAD');

select * from documentation_results where time_offset = 0;
  -- Set time_offset of case_data to negative if in past, positive if in future
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

