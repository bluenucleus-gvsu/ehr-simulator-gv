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
  admitting_diagnosis
) 
VALUES
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
    'Wallace Peterson', 
    'This will be a brief case description providing basic details of the case, perhaps mentioning events leading up to admission, current symptoms, and an area of focus for the simulation.', 
    'Wallace', 
    'Peterson', 
    'Full', 
    'Acute CHF Exacerbation'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', 
    'Melody Dix', 
    'This will be a brief case description providing basic details of the case, perhaps mentioning events leading up to admission, current symptoms, and an area of focus for the simulation.', 
    'Melody', 
    'Dix', 
    'Full', 
    'Acute Pancreatitis'
  ),
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 
    'Robert Chen', 
    'Patient presents with shortness of breath, productive cough, and a fever of 102.4F that began two days ago. Simulation focus on respiratory assessment and antibiotic administration.', 
    'Robert', 
    'Chen', 
    'DNR',       
    'Community Acquired Pneumonia'
  ),
  (
    '5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 
    'Sarah Jenkins', 
    'Patient brought in by EMS with altered mental status and a fruity odor to her breath. Blood glucose on arrival is 450 mg/dL. Simulation focus on fluid resuscitation and insulin drip protocols.', 
    'Sarah', 
    'Jenkins', 
    'Full', 
    'Diabetic Ketoacidosis (DKA)'
  );

-- INSERT INTO public.section_assignments (section_id, case_id, sim_time, presim_time) 
-- VALUES  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 01:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 02:00:00+00', '2026-02-02 01:00:00+00'),

--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 03:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 04:00:00+00', '2026-02-02 01:00:00+00'),

--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 05:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 06:00:00+00', '2026-02-02 01:00:00+00'),

--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 07:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 08:00:00+00', '2026-02-02 01:00:00+00'),

--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 09:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 10:00:00+00', '2026-02-02 01:00:00+00'),

--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 11:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 12:00:00+00', '2026-02-02 01:00:00+00'),

--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-01-05 13:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-01-05 14:00:00+00', '2026-02-02 01:00:00+00'),

--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 15:00:00+00', '2026-02-02 01:00:00+00'),
--         ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 16:00:00+00', '2026-02-02 01:00:00+00');



INSERT INTO public.course_cases (course_id, case_id) 
VALUES  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c6a', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d' ),
        ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c6a', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d'),
        ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d'),
        ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d');

INSERT INTO public.case_sessions (id, case_id, group_id) VALUES ('a5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9a', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f');

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
  TRUE, 
  'Admission', 
  'Internal Medicine', 
  'Dr. Aris Thorne', 
  5, 
  '<p>1</p>'
);

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
  TRUE, 
  'Progress', 
  'Nursing', 
  'Nurse Jamie Lee', 
  10, 
  '<p>2</p>'
);

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
  TRUE, 
  'Consult', 
  'Cardiology', 
  'Dr. Sarah Chen', 
  15, 
  '<p>3</p>'
);
