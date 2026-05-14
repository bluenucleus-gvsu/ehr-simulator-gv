-- Maria Lopez Case
INSERT INTO "public"."medication_orders" ("case_id", "medication_id", "dose", "frequency", "priority", "instructions", "indication", "ordering_provider", "infusion_rate", "is_in_presim") VALUES 
  ('3aa3d373-0368-4d66-90dd-d3c1b530347e', (select id from medications where generic_name = 'oxycodone' AND dose = 5), 5, 'Q6H', 'PRN', 'Administer for moderate pain (4-6)', 'Moderate Pain', 'Dr. Chen', null, 'true');

-- Robert Jenkins Case
INSERT INTO "public"."medication_orders" ("case_id", "medication_id", "dose", "frequency", "priority", "instructions", "indication", "ordering_provider", "infusion_rate", "is_in_presim") VALUES 
  ('9c4d050f-f9bc-47aa-a0b3-461c12dd5337', (select id from medications where generic_name = 'furosemide' AND strength = 20), 40, 'ONCE', 'NOW', null, 'Diuesis', 'Dr. Chen', null, 'true');

INSERT INTO "public"."medication_administrations" ("case_id", "medication_id", "administrator", "time_offset", "status", "notes", "is_in_presim", "medication_order_id") VALUES 
  ('9c4d050f-f9bc-47aa-a0b3-461c12dd5337', null, null, 0, 'Due', '', 'true', (select id from medication_orders where case_id = '9c4d050f-f9bc-47aa-a0b3-461c12dd5337' AND dose = 40));

INSERT INTO "public"."documentation_results" ("case_id", "is_in_presim", "time_offset", "hr", "hr_source", "bp", "bp_source", "rr", "temp", "temp_source", "spo2", "heart_sounds", "extremities", "lung_sounds") VALUES 
  ('9c4d050f-f9bc-47aa-a0b3-461c12dd5337', 'true', '-60', '112', 'Monitor', '158/72', 'Right upper arm', '22', '37.0', 'Oral', '92', 'tachycardic', 'lower extremity edema', 'crackles bilaterally');