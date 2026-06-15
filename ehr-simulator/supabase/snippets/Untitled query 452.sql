select * from documentation_results where case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d'

DELETE FROM documentation_results where time_offset in (-10, -20) AND case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d';

UPDATE documentation_results SET agitation = '4' where case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND time_offset = -10;

select * from users

delete from cases where id = 'b93ed9dc-434f-4c51-9c8f-cab69cc52b2c'

INSERT INTO orders (
  case_id, 
  category, 
  title, 
  details, 
  status, 
  provider, 
  is_important, 
  is_in_presim
)
VALUES
  -- Nursing Orders
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Nursing', 
    'Vital Signs', 
    'Assess vital signs every 4 hours. Notify provider for SBP < 90 or HR > 110.', 
    'Active', 
    'Dr. Sarah Chen', 
    true, 
    true
  ),
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Nursing', 
    'Strict I&O', 
    'Record strict intake and output every shift.', 
    'Active', 
    'Dr. Sarah Chen', 
    false, 
    true
  ),

  -- Respiratory Orders
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Respiratory', 
    'Oxygen Therapy', 
    'Titrate O2 via nasal cannula at 2-4 L/min to maintain SpO2 > 92%.', 
    'Active', 
    'Dr. Michael Taylor', 
    true, 
    true
  ),
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Respiratory', 
    'Continuous Pulse Oximetry', 
    'Maintain continuous SpO2 monitoring. Alarms set to 90% low.', 
    'Active', 
    'Dr. Michael Taylor', 
    false, 
    true
  ),

  -- Laboratory Orders
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Laboratory', 
    'Complete Blood Count (CBC)', 
    'STAT draw, evaluate for potential infection or anemia.', 
    'Pending', 
    'Dr. Emily Wang', 
    true, 
    false
  ),
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Laboratory', 
    'Basic Metabolic Panel (BMP)', 
    'Routine AM draw. Monitor potassium levels.', 
    'Completed', 
    'Dr. Emily Wang', 
    false, 
    true
  ),
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Nursing', 
    'Vital Signs', 
    'Assess vital signs every 4 hours. Notify provider for SBP < 90 or HR > 110.', 
    'Active', 
    'Dr. Sarah Chen', 
    true, 
    true
  ),
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Nursing', 
    'Strict I&O', 
    'Record strict intake and output every shift.', 
    'Active', 
    'Dr. Sarah Chen', 
    false, 
    true
  ),

  -- Respiratory Orders
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Respiratory', 
    'Oxygen Therapy', 
    'Titrate O2 via nasal cannula at 2-4 L/min to maintain SpO2 > 92%.', 
    'Active', 
    'Dr. Michael Taylor', 
    true, 
    true
  ),
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Respiratory', 
    'Continuous Pulse Oximetry', 
    'Maintain continuous SpO2 monitoring. Alarms set to 90% low.', 
    'Active', 
    'Dr. Michael Taylor', 
    false, 
    true
  ),

  -- Laboratory Orders
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Laboratory', 
    'Complete Blood Count (CBC)', 
    'STAT draw, evaluate for potential infection or anemia.', 
    'Pending', 
    'Dr. Emily Wang', 
    true, 
    false
  ),
  (
    '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 
    'Laboratory', 
    'Basic Metabolic Panel (BMP)', 
    'Routine AM draw. Monitor potassium levels.', 
    'Completed', 
    'Dr. Emily Wang', 
    false, 
    true
  );