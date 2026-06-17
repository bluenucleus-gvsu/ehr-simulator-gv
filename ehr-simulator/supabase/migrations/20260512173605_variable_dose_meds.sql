-------------------------------------------------------------
-- Add modifiable infusion rate to medication_administrations
-------------------------------------------------------------
ALTER TABLE IF EXISTS medication_administrations
  ADD COLUMN IF NOT EXISTS infusion_rate numeric;

ALTER TABLE IF EXISTS student_medication_administrations
  ADD COLUMN IF NOT EXISTS infusion_rate numeric;

-- Update view to include infusion_rate
DROP VIEW IF EXISTS all_medication_administrations;
CREATE OR REPLACE VIEW all_medication_administrations AS 
  SELECT 
    case_id,
    NULL::uuid as case_session_id,
    medication_order_id,
    administrator,
    time_offset,
    status,
    notes,
    administered_dose,
    infusion_rate,
    is_in_presim,
    'case_administration' as source_type    
  FROM medication_administrations

  UNION ALL

  SELECT
    case_id,
    case_session_id,
    medication_order_id,
    administrator,
    time_offset,
    status,
    notes,
    administered_dose,
    infusion_rate,
    is_in_presim,
    'student_administration' as source_type  
  FROM student_medication_administrations;

ALTER TABLE IF EXISTS medication_orders 
  ALTER COLUMN dose DROP NOT NULL;

ALTER TABLE IF EXISTS medications 
  DROP COLUMN IF EXISTS is_continuous,
  ADD COLUMN is_variable_dose boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS medication_administrations
  DROP COLUMN IF EXISTS medication_id;

------------------------------------------------------------------------
-- Update unique constraint to allow for fixed and variable dose insulins
------------------------------------------------------------------------
ALTER TABLE medications 
  DROP CONSTRAINT IF EXISTS medications_generic_name_route_strength_strength_unit_key; 

ALTER TABLE medications 
  ADD CONSTRAINT medications_unique_profile UNIQUE (generic_name, route, strength, strength_unit, is_variable_dose);


------------------------------------
-- 3 New Medications
------------------------------------
-- Heparin Sodium continuous infusion
-- Heparin Sodium injection IV (bolus)
-- Variable Dose Insulin Lispro

INSERT INTO medications (
  generic_name, 
  brand_name, 
  route, 
  strength, 
  strength_unit, 
  dispense_unit_id, 
  infusion_rate_unit, 
  diluent, 
  total_volume, 
  is_variable_dose
) 
VALUES 
  ('heparin sodium', null, 'IV', 25000, 'units', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', 'normal saline 0.9%', 250, true),
  ('heparin sodium', null, 'IV', 10000, 'units', (SELECT id FROM dispense_units WHERE name = 'Vial'), null, null, 10, true),
  ('insulin lispro', 'Humalog', 'SC', 1, 'units', (SELECT id FROM dispense_units WHERE name = 'Unit'), NULL, NULL, NULL, true)
ON CONFLICT (generic_name, route, strength, strength_unit, is_variable_dose) DO NOTHING;
