------------------------------------
-- New Medications for summer sims
------------------------------------

-- Ondansetron 4mg SL
-- Protonix continuous infusion *
-- Potassium Chloride 20 mEq PO
-- Insulin Lispro (Humalog)- 24hr corrective- does not need to be a sliding scale
-- Aspirin 81mg PO
-- Nitroglycerin 0.4mg SL
-- Oxycodone 10mg PO


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
  is_continuous
) 
VALUES 
  ('ondanestron', 'Zofran', 'SL', 4, 'mg', (SELECT id FROM dispense_units WHERE name = 'Dissolvable tab'), null, null, null, false),
  ('potassium chloride', null, 'PO', 20, 'mEq', (SELECT id FROM dispense_units WHERE name = 'Tablet'), null, null, null, false),
  ('insulin lispro', 'Humalog', 'SC', 1, 'units', (SELECT id FROM dispense_units WHERE name = 'Unit'), NULL, NULL, NULL, false),
  ('aspirin', null, 'PO', 81, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), null, null, null, false),
  ('nitroglycerin', null, 'SL', 0.4, 'mg', (SELECT id FROM dispense_units WHERE name = 'Dissolvable tab'), null, null, null, false),
  ('pantoprazole', null, 'IV', 80, 'mg', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', 'normal saline 0.9%', 100, false),
  ('oxycodone', 'Roxicodone', 'PO', 5, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), null, null, null, false)
ON CONFLICT (generic_name, route, strength, strength_unit) DO NOTHING;
