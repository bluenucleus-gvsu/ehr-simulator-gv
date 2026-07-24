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
  ('furosemide',
    'Lasix',
    'IV',
    40,
    'units',
    (SELECT id FROM dispense_units WHERE name = 'Vial'), 
    'mL/hr',
    'normal saline 0.9%',
    10,
    true),

  ('insulin regular',
    'Humulin',
    'IV',
    100,
    'units/mL',
    (SELECT id FROM dispense_units WHERE name = 'Vial'), 
    NULL,
    '',
    0.1,
    true),

  ('Dextrose 50%',
    '',
    'IV',
    0.5,
    'grams/mL',
    (SELECT id FROM dispense_units WHERE name = 'Vial'), -- Amp / Preload
    NULL,
    'Water',
    50,
    true)
ON CONFLICT (generic_name, route, strength, strength_unit, is_variable_dose) DO NOTHING;

