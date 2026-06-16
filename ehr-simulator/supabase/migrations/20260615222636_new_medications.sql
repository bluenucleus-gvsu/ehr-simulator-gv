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
  ('pantoprazole', 'Protonix', 'IV', 40, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), null, null, null, false),
  ('diphenhydramine ', 'Benadryl', 'IV', 50, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), null, null, null, false)
ON CONFLICT (generic_name, route, strength, strength_unit, is_variable_dose) DO NOTHING;
