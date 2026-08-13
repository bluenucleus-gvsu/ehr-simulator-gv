-- Case Id and Session Id for testing
-- http://127.0.0.1:3000/simulation/e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d/a5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9a/chart/mar

-- Expose all tables to the API for local development
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON all_documentation_results TO anon, authenticated, service_role;

INSERT INTO public.courses (id, name, code, active)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Medical Surgical Nursing I', 'NUR 320', TRUE),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'Medical Surgical Nursing II', 'NUR 420', TRUE),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5f', 'Obstetrical Nursing', 'NUR 360', TRUE),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c6a', 'Mental Health Nursing', 'NUR 380', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.sections (id, course_id, name, meeting_time)
VALUES 
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Section 1', '2026-02-05 12:00:00+00'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Section 2', '2026-02-05 15:00:00+00'),

  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'Section 1', '2026-02-05 12:00:00+00'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'Section 2', '2026-02-05 15:00:00+00'),

  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5f', 'Section 1', '2026-02-05 12:00:00+00'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5f', 'Section 2', '2026-02-05 15:00:00+00'),
  
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c6a', 'Section 1', '2026-02-05 12:00:00+00'),
  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c6a', 'Section 2', '2026-02-05 15:00:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO public.groups (id, section_id, name)
VALUES 
  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Group B'),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7b', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8c', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'Group B'),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7d', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8e', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'Group B'),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1a', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f1b', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'Group B'),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1c', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f1e', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'Group B'),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2a', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'Group B'),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2b', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2c', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'Group B'),

  ('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'Group A'),
  ('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2e', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'Group B')
ON CONFLICT DO NOTHING;
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
VALUES 
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'student234@gvsu.edu', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'student154@gvsu.edu', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'student243@gvsu.edu', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'student387@gvsu.edu', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated'),
  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'faculty654@gvsu.edu', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, role, full_name, email)
VALUES 
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'student', 'John Smith', 'student234@gvsu.edu'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'student', 'Ryan Smith', 'student154@gvsu.edu'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'student', 'Lynn Smith', 'student243@gvsu.edu'),
  ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'student', 'Suzy Smith', 'student387@gvsu.edu'),

  ('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'faculty', 'Prof. Test', 'faculty654@gvsu.edu')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

INSERT INTO public.group_members (student_id, group_id, active)
VALUES ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', true),

       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7b', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7b', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8c', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8c', true),

       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7d', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7d', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8e', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8e', true),

       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1a', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1a', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f1b', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f1b', true),

       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1c', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1c', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f1e', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f1e', true),

       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1f', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e1f', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2a', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2a', true),

       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2b', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2b', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2c', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2c', true),

       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2e', true),
       ('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9d', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f2e', true);

INSERT INTO public.cases (
  id, 
  name, 
  description, 
  first_name, 
  last_name, 
  code_status, 
  admitting_diagnosis,
  case_specialty
) 
VALUES
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    'Wallace Peterson', 
    'This will be a brief case description providing basic details of the case, perhaps mentioning events leading up to admission, current symptoms, and an area of focus for the simulation.', 
    'Wallace', 
    'Peterson', 
    'Full', 
    'Acute CHF Exacerbation',
    'med_surg'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', 
    'Melody Dix', 
    'This will be a brief case description providing basic details of the case, perhaps mentioning events leading up to admission, current symptoms, and an area of focus for the simulation.', 
    'Melody', 
    'Dix', 
    'Full', 
    'Acute Pancreatitis',
    'med_surg'
  ),
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 
    'Robert Chen', 
    'Patient presents with shortness of breath, productive cough, and a fever of 102.4F that began two days ago. Simulation focus on respiratory assessment and antibiotic administration.', 
    'Robert', 
    'Chen', 
    'DNR',       
    'Community Acquired Pneumonia',
    'med_surg'
  ),
  (
    '5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 
    'Sarah Jenkins', 
    'Patient brought in by EMS with altered mental status and a fruity odor to her breath. Blood glucose on arrival is 450 mg/dL. Simulation focus on fluid resuscitation and insulin drip protocols.', 
    'Sarah', 
    'Jenkins', 
    'Full', 
    'Diabetic Ketoacidosis (DKA)',
    'med_surg'
  );

INSERT INTO public.section_assignments (section_id, case_id, sim_time, presim_time) 
VALUES  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-02-05 01:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 02:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-02-05 03:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 04:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 05:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-02-05 06:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 07:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-02-05 08:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 09:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-02-05 10:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 11:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-02-05 12:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-01-05 13:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-01-05 14:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 15:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', '2026-02-05 16:00:00+00', '2026-02-02 01:00:00+00');



INSERT INTO public.course_cases (course_id, case_id) 
VALUES  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c6a', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d' ),
        ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c6a', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d'),
        ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d'),
        ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d');

INSERT INTO public.case_sessions (id, case_id, group_id) VALUES ('a5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9a', 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f');

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
  TRUE, 
  'Admission', 
  'Internal Medicine', 
  'Dr. Aris Thorne', 
  -60, 
  '<p>1</p>'
);

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
  TRUE, 
  'Progress', 
  'Nursing', 
  'Nurse Jamie Lee', 
  -30, 
  '<p>2</p>'
);

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
  TRUE, 
  'Consult', 
  'Cardiology', 
  'Dr. Sarah Chen', 
  -150, 
  '<p>3</p>'
);


INSERT INTO medication_orders (
  case_id, 
  medication_id, 
  dose, 
  frequency, 
  priority, 
  instructions, 
  indication, 
  ordering_provider,
  infusion_rate,
  is_in_presim
) 
VALUES
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'heparin sodium' AND strength = 10000 LIMIT 1),
    null, 
    'Q6H', 
    'PRN', 
    null, 
    'VTE', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ), 
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'heparin sodium' AND strength = 25000 LIMIT 1),
    null, 
    'CONTINUOUS', 
    'NOW', 
    null, 
    'VTE', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ), 
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1),
    650, 
    'Q6H', 
    'PRN', 
    'Do not exceed 4000mg per 24 hours.', 
    'Mild pain or fever', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1),
    1950, 
    'Q6H', 
    'PRN', 
    'Do not exceed 4000mg per 24 hours.', 
    'Mild pain or fever', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1),
    1300, 
    'Q6H', 
    'PRN', 
    'Do not exceed 4000mg per 24 hours.', 
    'Mild pain or fever', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'albuterol sulfate' LIMIT 1),
    30, 
    'Q6H', 
    'Routine', 
    null, 
    'Indic.', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'metoprolol tartate' AND route = 'IV' AND strength = 10 AND strength_unit = 'mg' LIMIT 1),
    10, 
    'ONCE', 
    'NOW', 
    'Administer slow IV push over 2 minutes. Monitor HR and BP.', 
    'Rate control', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'atorvastatin' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1),
    40, 
    'DAILY', 
    'Routine', 
    'Take in the evening.', 
    'Hyperlipidemia', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'aspirin' AND strength_unit = 'mg' LIMIT 1),
    81, 
    'DAILY', 
    'Routine', 
    'Take in the evening.', 
    'Hyperlipidemia', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'normal saline 0.9%' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mL' LIMIT 1), 
    1000, 
    'CONTINUOUS', 
    'Routine', 
    'Maintenance fluids', 
    'Hydration', 
    'Dr. Gregory House',
    125,
    TRUE
  ),

  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'cefazolin' LIMIT 1), 
    1000, 
    'Q8H', 
    'Routine', 
    'Administer over 30 minutes.', 
    'Prophylaxis', 
    'Dr. Gregory House',
    150,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'pantoprazole' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1), 
    40, 
    'DAILY', 
    'Routine', 
    'Take 30 minutes before breakfast.', 
    'GERD', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'insulin glargine' AND route = 'SC' AND strength = 1 AND strength_unit = 'units' LIMIT 1), 
    15,
    'DAILY', 
    'Routine', 
    'Give at bedtime. Rotate injection sites.', 
    'T2DM', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'cefazolin' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mg' LIMIT 1), 
    1000, 
    'Q2H', 
    'Routine', 
    null, 
    'Prophylaxis', 
    'Dr. Pepper',
    125,
    FALSE
  ),
  (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'ceftriaxone' AND route = 'IV' LIMIT 1), 
    1, 
    'Q2H', 
    'Routine', 
    'Not in Presim Test.', 
    'Prophylaxis', 
    'Dr. Pepper',
    null,
    FALSE
  ),
  (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'dextrose 5% in NS 0.45%' AND route = 'IV' LIMIT 1), 
    1000, 
    'Q2H', 
    'Routine', 
    'Not in Presim Test.', 
    'Prophylaxis', 
    'Dr. Pepper',
    100,
    FALSE
  ),
  (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'enoxaparin' LIMIT 1), 
    40, 
    'Q2H', 
    'Routine', 
    null, 
    'Prophylaxis', 
    'Dr. Pepper',
    null,
    FALSE
  ),
  (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'furosemide' LIMIT 1), 
    40, 
    'Q2H', 
    'Routine', 
    null, 
    'Prophylaxis', 
    'Dr. Pepper',
    null,
    FALSE
  ),
  (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'methylprednisolone' LIMIT 1), 
    500, 
    'Q2H', 
    'Routine', 
    null, 
    'Prophylaxis', 
    'Dr. Pepper',
    null,
    FALSE
  ),
  (
  'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'metoprolol succinate' and strength = 25 LIMIT 1), 
    75, 
    'Q2H', 
    'Routine', 
    null, 
    'Prophylaxis', 
    'Dr. Pepper',
    null,
    FALSE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'pantoprazole' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1), 
    60, 
    'DAILY', 
    'Routine', 
    'Not in Presim Test.', 
    'GERD', 
    'Dr. Oops',
    NULL,
    FALSE
  ),
  -- not in presim
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'insulin glargine' AND route = 'SC' AND strength = 1 AND strength_unit = 'units' LIMIT 1), 
    999, 
    'DAILY', 
    'Routine', 
    'Not in Presim Test.', 
    'T2DM', 
    'Dr. Huh',
    NULL,
    FALSE
  );

INSERT INTO medication_administrations (
  case_id,
  medication_order_id,
  administrator,
  time_offset,
  status,
  notes,
  administered_dose
)
VALUES
  -- 1. Acetaminophen (Given 60 minutes ago)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -60,
    'Given',
    'Patient reported mild headache (3/10).',
    650
  ),

  -- 2. Acetaminophen (Scheduled 60 minutes from now for next PRN dose)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    NULL,
    60,
    'Due',
    NULL,
    NULL
  ),

  -- 3. Metoprolol tartrate (Given 15 minutes ago)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'metoprolol tartate' AND route = 'IV' AND strength = 10 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -15,
    'Given',
    'IV pushed slowly over 2 minutes. Heart rate stable at 82 bpm.',
    10
  ),

  -- 4. Atorvastatin (Given 90 minutes ago)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'atorvastatin' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -90,
    'Given',
    'Taken with sips of water.',
    40
  ),

  -- 5. Atorvastatin (Missed dose 100 minutes ago - demonstrating a different status)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'atorvastatin' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -100,
    'Missed',
    'Patient was off unit for imaging.',
    0
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'normal saline 0.9%' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mL' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -170,
    'Given',
    'IV infusing well via right forearm, no redness or swelling.',
    1000
  ),

  -- 2. Cefazolin (Given 2 hours ago / -120 mins)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'cefazolin' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -120,
    'Given',
    'Infused via IV pump over 30 mins. Tolerated well.',
    1000
  ),

  -- 3. Cefazolin (Next dose due in 6 hours / +360 mins)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'cefazolin' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    NULL,
    40,
    'Due',
    NULL,
    NULL
  ),

  -- 4. Pantoprazole (Given this morning, 5 hours ago / -300 mins)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'pantoprazole' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -130,
    'Given',
    'Taken with water.',
    40
  ),

  -- 5. Insulin glargine (Due tonight in 4 hours / +240 mins)
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'insulin glargine' AND route = 'SC' AND strength = 1 AND strength_unit = 'units' LIMIT 1) LIMIT 1),
    NULL,
    30,
    'Due',
    NULL,
    NULL
  );

  INSERT INTO documentation_results (
  case_id, 
  is_in_presim, 
  time_offset, 
  hr, 
  bp, 
  rr, 
  temp, 
  spo2, 
  pain_numeric_scale, 
  appearance, 
  lung_sounds, 
  heart_sounds, 
  abdomen
) VALUES 
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', true, -30, 
    '82', '120/80', '16', '37.1', '98%', '2', 
    'Calm and cooperative', 'Clear bilaterally', 'Regular rate and rhythm', 'Soft, non-tender'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', true, 0, 
    '88', '125/82', '18', '37.3', '97%', '4', 
    'Slightly anxious', 'Clear bilaterally', 'Regular rate and rhythm', 'Mildly tender'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', true, -100, 
    '95', '130/85', '20', '37.4', '96%', '6', 
    'Restless, grimacing', 'Diminished at bases', 'Tachycardic', 'Guarding noted'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d', true, -180, 
    '85', '122/80', '16', '37.2', '99%', '3', 
    'Resting comfortably', 'Clear bilaterally', 'Regular rate and rhythm', 'Soft, non-tender'
  );

SET session_replication_role = replica;
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


INSERT INTO "public"."cases" ("id", "name", "description", "first_name", "last_name", "date_of_birth", "code_status", "height_ft", "height_in", "weight_kg", "isolation_precautions_id", "language", "insurance", "employment", "relationship_status_id", "religion", "requires_interpreter", "admitting_diagnosis", "attending_provider", "inpatient_duration_days", "time_of_admission", "medical_history", "surgical_history", "allergies", "social_habits", "living_situation", "updated_at", "created_at", "emergency_contact_name", "emergency_contact_relationship", "case_specialty") VALUES
	('2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Case Harold Adams', 'Mr. Harold Adams, a 72-year-old male, was admitted two days ago for hyponatremia related to vomiting and diarrhea from a gastrointestinal illness he caught on a cruise. His sodium levels have been improving, but this morning, he begins to show signs of infection and early septic shock.', 'Harold', 'Adams', '1954-03-22', 'Full', 6, 2, 75, NULL, 'English', NULL, 'Retired School Teacher', NULL, 'None', false, 'Hyponatremia', 'David Adler MD', 2, '09:00:00', '{Hypertension,GERD}', '{Appendectomy}', '{Seasonal}', '{}', '{"Lives with Spouse"}', '2026-03-19 20:20:08.403+00', '2026-03-19 20:16:45.238+00', 'Linda Adams', 'Wife', 'med_surg');



INSERT INTO "public"."case_family_history" ("id", "case_id", "relationship_id", "condition") VALUES
	('4e3d98a6-e22f-40db-a8df-20a84c13fe54', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'f7748742-acf9-459c-bec6-7cc1dd607a8c', 'Type 2 Diabetes'),
	('70d8819b-d55a-4018-8afd-316c1bf98858', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', '613d793a-51b9-4fad-b3f0-14f53ded1e3a', 'CHF');



INSERT INTO "public"."case_safety_alerts" ("case_id", "safety_alert_id", "created_at") VALUES
	('2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'eb4f2ae4-b3fd-4ad3-b6be-847009df98c9', '2026-03-19 20:20:09.168264+00'),
	('2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'c07560fb-083b-4929-ada5-e7fade0e81d5', '2026-03-19 20:20:09.168264+00'),
	('2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', '6d6b08ac-d28d-4f7d-ad95-1bfc14196e35', '2026-03-19 20:20:09.168264+00');


INSERT INTO "public"."clinical_documents" ("id", "case_id", "is_in_presim", "category", "specialty", "author", "time_offset", "doc_text", "created_at") VALUES
	('3982f7ba-8418-4d73-ad82-8e9952a5e87b', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Nursing', 'Nursing', 'Barbara Gifford, RN', 240, '<p>Assessment:<br>Patient lethargic, responds slowly to questions. Skin hot and flushed. Continues to report weakness and “feeling off.” Mucous membranes dry.<br></p><p>Vital Signs: T 39.0, HR 118, BP 90/56, RR 24, SpO₂ 93%.</p><p></p><p>Concerns:</p><ul class="list-disc ml-6"><li><p>Urine output only 80 mL since midnight.</p></li><li><p>Patient increasingly confused.</p></li><li><p>Tachycardia and hypotension worsening.</p></li></ul><p></p><p>Actions: Notified physician, applied cool compresses, encouraged oral fluids but patient unable to tolerate.</p>', '2026-03-19 20:40:02.736559+00'),
	('d588719f-365e-4bb8-a9c5-2ba3dae33714', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Progress', 'Nursing', 'Derrick Williams, RN', 960, '<p>Assessment:<br>Patient restless but cooperative. Skin warm, flushed. Mucous membranes remain dry. Slight confusion—incorrectly reported date once. Complains of “feeling hot.”</p><p></p><p>Vital Signs:<br> T 38.4, HR 110, BP 96/58, RR 22, SpO₂ 94% RA.<br></p><p>Physical Findings:</p><ul class="list-disc ml-6"><li><p>Cap refill 3–4 sec</p></li><li><p>Urine output 150 mL over last 4 hours</p></li><li><p>Lungs clear but diminished at bases<br></p></li></ul><p>Cooling measures applied. Notified physician of hypotension and mental status change. Provided oral fluids; patient tolerated small amounts. Physician aware; will reassess.</p>', '2026-03-19 20:40:02.736559+00'),
	('c88a2dab-e487-41ce-8a8a-5bdd500b3b44', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Consult', 'Occupational Therapy', 'Susan Bower, OT', 960, '<h2><u>Subjective</u></h2><p>Patient states: “I feel weaker today.”</p><h2><u>Objective</u></h2><ul class="list-disc ml-6"><li><p>Difficulty maintaining balance while sitting and standing.</p></li><li><p>Increasing fatigue with minimal activity.</p></li><li><p>Orthostatic symptoms persist: BP drop from 108/66 sitting → 94/60 standing</p></li></ul><h2><u>Assessment</u></h2><p>Reduced functional tolerance. Potential early infection contributing to increased fatigue</p><h2><u>Plan</u></h2><p>Hold therapy until vital signs stabilize.</p>', '2026-03-19 20:40:02.736559+00'),
	('3b0afdb8-0c2d-472e-86ef-4607ae276ded', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Progress', 'Internal Medicine', 'Dr. David Adler', 1380, '<h2><u>Subjective</u></h2><p>&nbsp;Patient “feels warm” and reports worsening fatigue and nausea overnight. Appetite poor.</p><h2><u>Objective</u></h2><ul class="list-disc ml-6"><li><p>Vitals: T 38.1, HR 104, BP 102/62, RR 22, SpO₂ 95%</p></li><li><p>Skin warm, flushed.</p></li><li><p>Urine output decreasing over past 12 hours.</p></li><li><p>Mild confusion noted when answering questions.</p></li><li><p>Na⁺ 129</p></li><li><p>BUN 28, Creatinine 1.2</p></li><li><p>WBC 13,500 (neutrophils 78%)</p></li><li><p>Lactic acid 1.7 (upper end of normal)</p></li></ul><h2><u>Assessment</u></h2><p>New fever with rising WBC and worsening fatigue → concern for developing infection. Electrolytes showing continued dehydration. Mentation slightly altered.</p><h2><u>Plan</u></h2><ul class="list-disc ml-6"><li><p>Monitor vitals Q4 hours.</p></li><li><p>Encourage PO intake.</p></li><li><p>Repeat labs in AM.</p></li><li><p>Consider infectious workup if fever persists &gt;24 hours.</p></li><li><p>Continue maintenance IV fluids.</p></li></ul><p></p>', '2026-03-19 20:40:02.736559+00'),
	('731183a0-9329-4af0-a03d-190743a18b13', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Consult', 'Physical Therapy', 'Mark LeGrande, PT', 2400, '<h2><u>Subjective</u></h2><p>&nbsp;Patient reports “feeling weak” and slightly dizzy when standing.</p><h2><u>Objective</u></h2><p>Transfers: required minimal assistance.</p><p>Gait: unsteady initially.<br>Orthostatic vitals during session:</p><p>Supine BP 116/74 → standing BP 102/68<br>HR increased from 90 to 104<br>Patient reported lightheadedness.</p><h2><u>Assessment</u></h2><p>Orthostatic hypotension likely related to dehydration. Activity limited due to dizziness.</p><h2><u>Plan</u></h2><p>&nbsp;Recommend short sessions only; re-evaluate in 24–48 hours. Encourage slow positional changes.</p>', '2026-03-19 20:40:02.736559+00'),
	('da2358d3-63c8-43b6-a1c8-eba16d678ae2', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Progress', 'Nursing', 'Jane Smith RN', 2520, '<p>Assessment:<br>Patient awake, alert, cooperative. Complains of fatigue and mild dizziness on standing. Mucous membranes dry. Skin warm and slightly flushed.</p><p>Vital Signs:<br>T 37.6, HR 92, BP 114/70, RR 20, SpO₂ 96% RA.</p><p></p><p>Interventions:</p><ul class="list-disc ml-6"><li><p>Encouraged fluids.</p></li><li><p>Assisted patient to bathroom with standby assistance.</p></li><li><p>Noted concentrated urine.</p></li><li><p>Notified physician of continued dizziness upon standing.</p></li></ul><p></p><p>Response:<br> Patient tolerated interventions; continued monitoring planned.</p>', '2026-03-19 20:40:02.736559+00'),
	('a44db1fc-cf42-4c17-a55f-5fe54fb7e532', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Progress', 'Internal Medicine', 'Dr. Adler', 2880, '<h2><u>Subjective</u></h2><p>Patient presented with 3 days of nausea, vomiting, and diarrhea following return from cruise. Reports dizziness, fatigue, and poor oral intake.</p><h2><u>Objective</u></h2><ul class="list-disc ml-6"><li><p>Vitals: T 37.2°C, HR 88, BP 118/72, RR 18, SpO₂ 97% RA</p></li><li><p>Dry mucous membranes, skin tenting noted.</p></li><li><p>Alert and oriented ×3.</p></li><li><p>Abdomen soft, slightly tender, hyperactive bowel sounds.</p></li><li><p>Na⁺ 125 mEq/L, K⁺ 3.7 mEq/L</p></li><li><p>BUN 25 mg/dL, Creatinine 1.1 mg/dL</p></li><li><p>WBC 11,000/µL</p></li><li><p>Lactic acid 1.3 mmol/L</p></li></ul><h2><u>Assessment</u></h2><p>&nbsp;Hyponatremia likely secondary to fluid losses. Mild dehydration. Hemodynamically stable.</p><h2><u>Plan</u></h2><ul class="list-disc ml-6"><li><p>Start NS 75 mL/hr.</p></li><li><p>Advance diet as tolerated.</p></li><li><p>Monitor electrolytes every AM.</p></li><li><p>Fall precautions for dizziness.</p></li><li><p>PT/OT evaluation due to weakness.</p></li></ul><p></p>', '2026-03-19 20:40:02.736559+00'),
	('191cb1f2-e8d4-4fa3-aba2-96eb53a36509', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 'Admission', 'Emergency Medicine', 'Dr. Chen', 3000, '<p>Chief Complaint: “Vomiting and diarrhea for several days, feeling dizzy.”</p><p>History of Present Illness: 72-year-old male presenting after returning from a cruise 3 days ago. Reports persistent nausea, vomiting, and watery diarrhea since returning home. States he has been unable to tolerate solid food and has had minimal oral intake. Reports dizziness when standing and significant fatigue. Denies chest pain or shortness of breath. No blood in stool. Stool pathogen studies pending.</p><p>Past Medical History: Hypertension, GERD</p><p>Medications:</p><p>Lisinopril 10 mg daily</p><p>Omeprazole 20 mg daily</p><p></p><p>Allergies: No known drug allergies</p><p>Physical Examination:</p><p>General: Appears fatigued, mildly dehydrated</p><p>Neuro: Alert and oriented ×3</p><p>HEENT: Dry mucous membranes</p><p>Cardiac: Regular rate and rhythm</p><p>Respiratory: Clear breath sounds bilaterally</p><p>Abdomen: Soft, mild diffuse tenderness, hyperactive bowel sounds</p><p>Skin: Warm, decreased turgor</p><p></p><p>ED Vital Signs:</p><p>T: 37.6°C, HR: 90, BP: 116/70, RR: 18, SpO₂: 96% RA</p><p></p><p>ED Laboratory Results:</p><p>Na⁺ 125 mEq/L</p><p>K⁺ 3.7 mEq/L</p><p>Cl⁻ 94 mEq/L</p><p>BUN 25 mg/dL</p><p>Creatinine 1.1 mg/dL</p><p>WBC 11,000 /µL</p><p>Lactic acid 1.3 mmol/L</p><p></p><p>ED Treatment Provided:1 L Normal Saline IV bolus. Ondansetron 4 mg IV for nausea. Basic metabolic panel and CBC obtained. Patient monitored for several hours.</p><p>Assessment:</p><p>Hyponatremia and dehydration likely secondary to gastrointestinal illness. Patient stable but symptomatic with dizziness and electrolyte imbalance.</p><p></p><p>Plan:</p><p>Admit to medical-surgical floor for IV fluids, electrolyte monitoring, and observation.</p>', '2026-03-19 20:40:02.736559+00');
