ALTER TABLE IF EXISTS CASES
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS inpatient_duration_days,
  DROP COLUMN IF EXISTS time_of_admission,
  ADD COLUMN IF NOT EXISTS age text;

-- Add age value based on a case's date_of_birth field
UPDATE cases SET age = 72 WHERE id = '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc';
UPDATE cases SET age = 72 WHERE id = 'ad7f3138-3312-425a-aeac-578db75c7c43';
UPDATE cases SET age = 42 WHERE id = '3aa3d373-0368-4d66-90dd-d3c1b530347e';
UPDATE cases SET age = 67 WHERE id = '9c4d050f-f9bc-47aa-a0b3-461c12dd5337';
UPDATE cases SET age = 56 WHERE id = '37b3b78d-44cc-4391-8d6a-8d93dda40387';
UPDATE cases SET age = 68 WHERE id = '79fcd248-1efd-4971-b370-d4bdfd69c734';
UPDATE cases SET age = 1 WHERE id = 'f152f37b-80e3-4e9a-b09e-65006e9134a6';
UPDATE cases SET age = 70 WHERE id = '04ca168a-ab64-45bc-bbc0-e7bdf9d2e947';

-- case_data is empty, remnant from early schema design
DROP TABLE IF EXISTS case_data;
