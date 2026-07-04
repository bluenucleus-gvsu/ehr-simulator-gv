ALTER TABLE IF EXISTS CASES
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS inpatient_duration_days,
  DROP COLUMN IF EXISTS time_of_admission,
  ADD COLUMN IF NOT EXISTS age text;

-- case_data is empty, remnant from early schema design
DROP TABLE IF EXISTS case_data;
