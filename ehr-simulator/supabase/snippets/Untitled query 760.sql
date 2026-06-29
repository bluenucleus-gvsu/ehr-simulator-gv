UPDATE users SET role = 'admin' where full_name = 'Matt Smith';

INSERT INTO group_members (student_id, group_id) VALUES ((SELECT id from users where full_name = 'Matt Smith'),'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d');

INSERT INTO group_members (student_id, group_id) VALUES ((SELECT id from users where full_name = 'Matthew Smith'),'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d');

UPDATE public.users SET role = 'admin' where full_name = 'Matt Smith';

INSERT INTO course_cases (case_id, course_id) VALUES 
((SELECT id from cases where first_name = 'Harold'), (select id from courses where code = 'NUR 380'))

SELECT con.*
    FROM pg_catalog.pg_constraint con
        INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
        WHERE nsp.nspname = 'public'
             AND rel.relname = 'medications';
             
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
  ('insulin aspart', 'Humalog', 'SC', 1, 'units', (SELECT id FROM dispense_units WHERE name = 'Unit'), null, NULL, 50, false);
