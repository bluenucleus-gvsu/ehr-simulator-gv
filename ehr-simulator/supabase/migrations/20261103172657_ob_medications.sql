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
) VALUES 
  ('oxytocin', null, 'IV', 20, 'units', 16, 'mL/hr', 'normal saline 0.9%', 500, false),
  ('ibuprofen', null, 'PO', 600, 'mg', 1, null, null, null, false),
  ('docusate sodium', 'Colace', 'PO', 100, 'mg', 2, null, null, null, false),
  ('prenatal vitamin', null, 'PO', 1, 'tablet', 1, null, null, null, false),
  ('methergine', null, 'IM', 0.2, 'mcg', 16, null, null, null, false);


UPDATE medications 
  SET diluent = 'normal saline 0.9%'
  WHERE generic_name = 'vancomycin';

UPDATE medications 
  SET 
    generic_name = 'dextrose 50%',
    strength = 1,
    strength_unit = 'g',
    diluent = null,
    total_volume = null,
    is_variable_dose = false
  WHERE generic_name = 'Dextrose 50%';

UPDATE medications
  SET 
    strength_unit = 'mg',
    infusion_rate_unit = null,
    total_volume = null,
    is_variable_dose = false,
    diluent = null
  WHERE generic_name = 'furosemide' AND route = 'IV';

UPDATE medications
  SET
    strength = 1,
    strength_unit = 'units',
    total_volume = null,
    diluent = null,
    is_variable_dose = false
  WHERE brand_name = 'Humulin';


UPDATE medications 
  SET total_volume = null
  WHERE generic_name = 'heparin sodium' AND diluent IS null;

