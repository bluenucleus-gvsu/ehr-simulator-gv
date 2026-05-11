CREATE type medication_route_type as enum ('PO', 'IV', 'SC', 'IM', 'SL', 'Topical', 'Otic', 'Ophthalmic', 'Inhalation');
CREATE type iv_infusion_rate_type as enum ('mL/hr', 'mg/hr', 'units/hr');

-- Physical form of medications
CREATE TABLE IF NOT EXISTS dispense_units (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

INSERT INTO dispense_units (name, description) VALUES 
  ('Tablet', NULL), ('Capsule', NULL), ('Dissolvable tab', NULL), ('Chewable', NULL), 
  ('Tab', NULL), ('Patch', NULL), ('Lotion', NULL), ('MDI', 'Metered Dose Inhaler'), 
  ('DPI', 'Dry Powder Inhaler'), ('Nebulizer', NULL), ('Pre-filled Syringe', NULL), 
  ('Ampule', NULL), ('Syringe', NULL), ('Auto-Injector', NULL), ('Puff', NULL), 
  ('Vial', NULL), ('Bag', NULL), ('Unit', NULL)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generic_name TEXT NOT NULL,
  brand_name TEXT,
  route medication_route_type NOT NULL,
  strength numeric NOT NULL,
  strength_unit TEXT NOT NULL,
  dispense_unit_id INTEGER REFERENCES dispense_units(id) NOT NULL,

  -- IV Properties
  infusion_rate_unit iv_infusion_rate_type,
  diluent TEXT,
  total_volume numeric,
  is_continuous boolean NOT NULL DEFAULT false,
  UNIQUE (generic_name, route, strength, strength_unit)
);

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
  ('acetaminophen', 'Ofirmev', 'IV', 1000, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), 'mL/hr', NULL, 50, false),
  ('metoprolol succinate', 'Toprol XL', 'PO', 25, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('amoxicillin', 'Amoxil IV', 'IV', 500, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), 'mL/hr', 'normal saline 0.9%', 50, false),
  ('normal saline 0.9%', NULL, 'IV', 1000, 'mL', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', NULL, 1000, true),
  ('Lactated Ringer''s Injection ', NULL, 'IV', 1000, 'mL', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', NULL, 1000, true),
  ('piperacillin tazobactam', NULL, 'IV', 3.375, 'g', (SELECT id FROM dispense_units WHERE name = 'Vial'), 'mL/hr', 'normal saline 0.9%', 100, false),
  ('lisinopril', 'Zestril', 'PO', 10, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('vancomycin', 'Vancocin IV', 'IV', 1000, 'mg', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', 'sodium chloride 0.9%', 250, false),
  ('atorvastatin', 'Lipitor', 'PO', 40, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('acetaminophen', 'Tylenol', 'PO', 650, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('insulin glargine', 'Lantus', 'SC', 1, 'units', (SELECT id FROM dispense_units WHERE name = 'Unit'), NULL, NULL, NULL, false),
  ('furosemide', 'Lasix', 'PO', 20, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('pantoprazole', 'Protonix IV', 'IV', 40, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), 'mL/hr', 'D5W', 50, false),
  ('enoxaparin', 'Lovenox', 'SC', 40, 'mg', (SELECT id FROM dispense_units WHERE name = 'Pre-filled Syringe'), NULL, NULL, NULL, false),
  ('morphine sulfate', 'Morphine IV', 'IV', 4, 'mg', (SELECT id FROM dispense_units WHERE name = 'Ampule'), NULL, NULL, NULL, false),
  ('albuterol sulfate', 'ProAir HFA', 'Inhalation', 30, 'mcg', (SELECT id FROM dispense_units WHERE name = 'Puff'), NULL, NULL, NULL, false),
  ('ondansetron', 'Zofran IV', 'IV', 4, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), NULL, NULL, NULL, false),
  ('ceftriaxone', 'Rocephin IM', 'IM', 250, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), NULL, NULL, NULL, false),
  ('ceftriaxone', 'Rocephin', 'IV', 1, 'g', (SELECT id FROM dispense_units WHERE name = 'Syringe'), NULL, NULL, NULL, false),
  ('epinephrine', 'EpiPen', 'IM', 1, 'mg', (SELECT id FROM dispense_units WHERE name = 'Auto-Injector'), NULL, NULL, NULL, false),
  ('methylprednisolone', 'Solu-Medrol IV', 'IV', 125, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), 'mL/hr', 'NS 0.9%', 100, false),
  ('metoprolol tartate', 'Lopressor', 'IV', 10, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), NULL, NULL, NULL, false),
  ('nitroglycerin', 'Nitrostat', 'SL', 0.4, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tab'), NULL, NULL, NULL, false),
  ('lidocaine', NULL, 'IV', 2, 'mg', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', 'dextrose 5.0%', 500, false),
  ('dopamine', NULL, 'IV', 400, 'mg', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', 'dextrose 5.0%', 250, false),
  ('atropine sulfate', NULL, 'IV', 0.5, 'mg', (SELECT id FROM dispense_units WHERE name = 'Syringe'), NULL, NULL, NULL, false),
  ('dextrose 5% in NS 0.45%', NULL, 'IV', 1000, 'mL', (SELECT id FROM dispense_units WHERE name = 'Bag'), 'mL/hr', NULL, NULL, true),
  ('acetaminophen', 'Tylenol', 'PO', 325, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('cefazolin', 'Ancef', 'IV', 1000, 'mg', (SELECT id FROM dispense_units WHERE name = 'Vial'), 'mL/hr', NULL, NULL, false),
  ('sodium chloride', NULL, 'PO', 1, 'g', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false),
  ('pantoprazole', 'Protonix', 'PO', 40, 'mg', (SELECT id FROM dispense_units WHERE name = 'Tablet'), NULL, NULL, NULL, false)
ON CONFLICT (generic_name, route, strength, strength_unit) DO NOTHING;


CREATE type medication_frequencies as enum ('QD', 'BID', 'TID', 'QID', 'Q1H', 'Q2H', 'Q3H', 'Q4H', 'Q6H', 'Q8H', 'Q12H', 'Q24H', 'ACHS', 'DAILY', 'ONCE', 'CONTINUOUS');
CREATE type medication_priorities as enum ('STAT', 'NOW', 'Routine', 'PRN');

CREATE TABLE IF NOT EXISTS medication_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL references cases(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  dose numeric NOT NULL,
  frequency medication_frequencies NOT NULL,
  priority medication_priorities NOT NULL,
  instructions TEXT,
  indication TEXT,
  ordering_provider TEXT,
  infusion_rate TEXT,
  is_in_presim BOOLEAN NOT NULL DEFAULT TRUE
);

-- Link a medication administration to its corresponding order
ALTER TABLE IF EXISTS medication_administrations ADD COLUMN IF NOT EXISTS medication_order_id UUID references medication_orders(id) ON DELETE CASCADE;



