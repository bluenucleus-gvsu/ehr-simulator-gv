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
  ('amlodipine', 'Norvasc', 'PO', 10, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('chlorthalidone', 'Thalitone', 'PO', 25, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('spironolactone', 'Aldactone', 'PO', 25, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('rosuvastatin', 'Crestor', 'PO', 20, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('hydralazine', 'Apresoline', 'IV', 20, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), NULL, NULL, 1, false)
ON CONFLICT (generic_name, route, strength, strength_unit, is_variable_dose) DO NOTHING;
