-- Case Id and Session Id for testing
-- http://127.0.0.1:3000/simulation/e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d/a5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9a/chart/mar
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

INSERT INTO public.section_assignments (section_id, case_id, sim_time, presim_time) 
VALUES  ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 01:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 02:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 03:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6f', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 04:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 05:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7a', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 06:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 07:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7b', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 08:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 09:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7c', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 10:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 11:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7d', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 12:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-01-05 13:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7e', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-01-05 14:00:00+00', '2026-02-02 01:00:00+00'),

        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'e5f6a7b8-c9d0-4e5f-9c1f-4c5d6e7f8a9d', '2026-02-05 15:00:00+00', '2026-02-02 01:00:00+00'),
        ('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d7f', 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', '2026-02-05 16:00:00+00', '2026-02-02 01:00:00+00');



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
  -60, 
  '<p>1</p>'
);

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
  TRUE, 
  'Progress', 
  'Nursing', 
  'Nurse Jamie Lee', 
  -30, 
  '<p>2</p>'
);

INSERT INTO clinical_documents (case_id, is_in_presim, category, specialty, author, time_offset, doc_text)
VALUES (
  'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1),
    500, 
    'Q6H', 
    'PRN', 
    'Do not exceed 4000mg per 24 hours.', 
    'Mild pain or fever', 
    'Dr. Gregory House',
    NULL,
    TRUE
  ),
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'cefazolin' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mg' LIMIT 1), 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
  -- not in presim
  (
  'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
    (SELECT id FROM medications WHERE generic_name = 'cefazolin' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mg' LIMIT 1), 
    1000, 
    'Q2H', 
    'Routine', 
    'Not in Presim Test.', 
    'Prophylaxis', 
    'Dr. Pepper',
    999,
    FALSE
  ),
-- not in presim
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', 
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
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -60,
    'Given',
    'Patient reported mild headache (3/10).',
    650
  ),

  -- 2. Acetaminophen (Scheduled 60 minutes from now for next PRN dose)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'acetaminophen' AND route = 'PO' AND strength = 650 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    NULL,
    60,
    'Due',
    NULL,
    NULL
  ),

  -- 3. Metoprolol tartrate (Given 15 minutes ago)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'metoprolol tartate' AND route = 'IV' AND strength = 10 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -15,
    'Given',
    'IV pushed slowly over 2 minutes. Heart rate stable at 82 bpm.',
    10
  ),

  -- 4. Atorvastatin (Given 90 minutes ago)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'atorvastatin' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -90,
    'Given',
    'Taken with sips of water.',
    40
  ),

  -- 5. Atorvastatin (Missed dose 100 minutes ago - demonstrating a different status)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'atorvastatin' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -100,
    'Missed',
    'Patient was off unit for imaging.',
    0
  ),
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'normal saline 0.9%' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mL' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -170,
    'Given',
    'IV infusing well via right forearm, no redness or swelling.',
    1000
  ),

  -- 2. Cefazolin (Given 2 hours ago / -120 mins)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'cefazolin' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -120,
    'Given',
    'Infused via IV pump over 30 mins. Tolerated well.',
    1000
  ),

  -- 3. Cefazolin (Next dose due in 6 hours / +360 mins)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'cefazolin' AND route = 'IV' AND strength = 1000 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    NULL,
    40,
    'Due',
    NULL,
    NULL
  ),

  -- 4. Pantoprazole (Given this morning, 5 hours ago / -300 mins)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'pantoprazole' AND route = 'PO' AND strength = 40 AND strength_unit = 'mg' LIMIT 1) LIMIT 1),
    'Nurse Jackie, RN',
    -130,
    'Given',
    'Taken with water.',
    40
  ),

  -- 5. Insulin glargine (Due tonight in 4 hours / +240 mins)
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d',
    (SELECT id FROM medication_orders WHERE case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND medication_id = (SELECT id FROM medications WHERE generic_name = 'insulin glargine' AND route = 'SC' AND strength = 1 AND strength_unit = 'units' LIMIT 1) LIMIT 1),
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
  pain, 
  appearance, 
  lung_sounds, 
  heart_sounds, 
  abdomen
) VALUES 
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', true, -30, 
    '82', '120/80', '16', '37.1', '98%', '2', 
    'Calm and cooperative', 'Clear bilaterally', 'Regular rate and rhythm', 'Soft, non-tender'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', true, 0, 
    '88', '125/82', '18', '37.3', '97%', '4', 
    'Slightly anxious', 'Clear bilaterally', 'Regular rate and rhythm', 'Mildly tender'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', true, -100, 
    '95', '130/85', '20', '37.4', '96%', '6', 
    'Restless, grimacing', 'Diminished at bases', 'Tachycardic', 'Guarding noted'
  ),
  (
    'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d', true, -180, 
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


INSERT INTO "public"."cases" ("id", "name", "description", "first_name", "last_name", "date_of_birth", "code_status", "height_ft", "height_in", "weight_kg", "isolation_precautions_id", "language", "insurance", "employment", "relationship_status_id", "religion", "requires_interpreter", "admitting_diagnosis", "attending_provider", "inpatient_duration_days", "time_of_admission", "medical_history", "surgical_history", "allergies", "social_habits", "living_situation", "case_creation_complete", "updated_at", "created_at", "emergency_contact_name", "emergency_contact_relationship") VALUES
	('2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Case Harold Adams', 'Mr. Harold Adams, a 72-year-old male, was admitted two days ago for hyponatremia related to vomiting and diarrhea from a gastrointestinal illness he caught on a cruise. His sodium levels have been improving, but this morning, he begins to show signs of infection and early septic shock.', 'Harold', 'Adams', '1954-03-22', 'Full', 6, 2, 75, NULL, 'English', NULL, 'Retired School Teacher', NULL, 'None', false, 'Hyponatremia', 'David Adler MD', 2, '09:00:00', '{Hypertension,GERD}', '{Appendectomy}', '{Seasonal}', '{}', '{"Lives with Spouse"}', false, '2026-03-19 20:20:08.403+00', '2026-03-19 20:16:45.238+00', 'Linda Adams', 'Wife');



INSERT INTO "public"."case_family_history" ("id", "case_id", "relationship_id", "condition", "created_at") VALUES
	('4e3d98a6-e22f-40db-a8df-20a84c13fe54', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'f7748742-acf9-459c-bec6-7cc1dd607a8c', 'Type 2 Diabetes', '2026-03-19 20:20:09.548762+00'),
	('70d8819b-d55a-4018-8afd-316c1bf98858', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', '613d793a-51b9-4fad-b3f0-14f53ded1e3a', 'CHF', '2026-03-19 20:20:09.548762+00');



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



INSERT INTO "public"."documentation_results" ("id", "case_id", "is_in_presim", "time_offset", "hr", "hr_source", "bp", "bp_source", "rr", "temp", "temp_source", "spo2", "pain", "weight_kg", "oral", "intravenous", "enteral_nutrition", "parenteral_nutrition", "urine", "emesis", "stool", "wound_drainage", "enteral_output", "appearance", "safety_check", "mood_and_affect", "head_and_scalp", "eyes", "ears", "nose", "mouth_and_throat", "orientation", "speech", "motor_function", "integument_status", "skin", "hair_and_nails", "turgor", "wound", "heart_sounds", "extremities", "jugular_distention", "chest_appearance", "lung_sounds", "abdomen", "bowel_sounds", "nausea", "extremity_rom", "gait", "voiding", "iv_site", "iv_type", "iv_location", "nursing_care_provided", "nausea_vomiting", "tremor", "paroxysmal_sweats", "anxiety", "agitation", "tactile_disturbances", "visual_disturbances", "headache", "orientation2", "history_of_falling", "secondary_diagnosis", "ambulatory_aid", "iv_therapy_heparin_lock", "fall_risk_gait", "mental_status", "sensory_perception", "moisture", "activity", "mobility", "nutrition", "friction_and_shear", "breathing_independent_of_vocalization", "negative_vocalization", "facial_expression", "body_language", "consolability", "created_at") VALUES
	('08716b3c-ba40-4338-b062-19f99730421a', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 3000, '90', 'Monitor', '116/70', 'Right upper arm', '18', '37.6', 'Oral', '96', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'poor', NULL, NULL, NULL, NULL, NULL, NULL, 'tenderness', 'hyperactive', 'yes', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('2f849d33-5854-406a-a039-496d6c610d7a', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 2880, '88', 'Monitor', '118/72', 'Right upper arm', '18', '37.2', 'Oral', '97', NULL, '75', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('98d1cf6c-06be-4f88-b9c5-d1992885ae37', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 2640, '92', 'Monitor', '114/70', 'Right upper arm', '18', '37.4', 'Oral', '97', NULL, NULL, NULL, NULL, NULL, NULL, 'concentrated', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'clean, dry, intact', NULL, 'left AC', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, 3, 2, 2, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('e3843a84-0b28-420e-9fcf-6027d268cf05', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 2400, '90', 'Monitor', '116/74', 'Right upper arm', '20', '37.6', 'Oral', '96', NULL, NULL, '450', '600', NULL, NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('6bcf46ca-d04a-4e28-8e7d-558f5f031335', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 2390, '104', 'Monitor', '102/68', 'Right upper arm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('062f2065-108b-47f5-8260-3740473ba78c', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 2160, '96', 'Monitor', '110/68', 'Right upper arm', '20', '37.8', 'Oral', '96', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'clean, dry, intact', NULL, 'left AC', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, 3, 2, 2, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('359d22d3-e1a1-4675-bee1-91014f04db76', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 1920, '98', 'Monitor', '108/66', 'Right upper arm', '20', '37.9', 'Oral', '96', NULL, NULL, '300', '600', NULL, NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('aad18a2c-f63d-460c-bd2f-1dfe97ce79cb', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 1680, '100', 'Monitor', '106/64', 'Right upper arm', '20', '38.0', 'Oral', '96', NULL, '75.8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('55a87457-f5bf-4daa-a673-31c2856b5980', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 1440, '104', 'Monitor', '102/66', 'Right upper arm', '22', '38.1', 'Oral', '95', NULL, NULL, '150', '600', NULL, NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'flush, warm, diaphoretic', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Clear, diminished', 'tenderness', NULL, 'yes', NULL, NULL, NULL, 'clean, dry, intact', NULL, 'left AC', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, 3, 2, 2, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('08b4cd85-dbe8-4fe7-a2cb-f3c669a96f75', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 1200, '108', 'Monitor', '98/60', 'Right upper arm', '22', '38.6', 'Oral', '96', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('fff050a6-6200-4d81-aa40-95479f85bed5', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 960, '110', 'Monitor', '96/58', 'Right upper arm', '22', '38.4', 'Oral', '95', NULL, NULL, '200', '600', NULL, NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('10441215-7dbf-45b2-b543-4077daca9233', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 720, '112', 'Monitor', '94/58', 'Right upper arm', '24', '38.4', 'Oral', '94', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('dfe39c71-cbc0-43c5-b53f-e26015f85572', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'flush, warm, diaphoretic', NULL, 'poor', NULL, NULL, NULL, NULL, NULL, 'Clear, diminished', NULL, NULL, NULL, NULL, NULL, NULL, 'clean, dry, intact', NULL, 'left AC', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, 3, 2, 2, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('74ad8cb0-e81a-4b2a-8ed1-043784800a4e', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 480, '116', 'Monitor', '92/56', 'Right upper arm', '24', '38.8', 'Oral', '95', NULL, NULL, '150', '600', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('2bcbdddd-a961-4892-986c-32c0e0fe47ea', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', true, 240, '118', 'Monitor', '90/56', 'Right upper arm', '24', '38.4', 'Oral', '95', NULL, '76.2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00'),
	('d6196ba8-690d-447d-ac51-17b1f4589f1d', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', false, 0, ' ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '100', '600', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-19 22:00:37.030464+00');


INSERT INTO "public"."lab_results" ("id", "case_id", "time_offset", "is_in_presim", "sodium", "potassium", "chloride", "bun", "creatinine", "glucose", "co2", "calcium", "lactate", "rbc", "wbc", "platelets", "hemoglobin", "hematocrit", "mcv", "mch", "mchc", "troponin", "ckmb", "myoglobin", "ast", "alt", "alp", "total_bilirubin", "albumin", "ammonia", "pco2", "po2", "hco3", "specific_gravity", "urine_ph", "protein", "urine_glucose", "ketones", "leukocyte_esterase", "nitrites", "blood", "pt", "ptt", "crp", "esr", "tsh", "free_t3", "free_t4", "total_cholesterol", "hdl_cholesterol", "ldl_cholesterol", "triglycerides", "magnesium", "phosphate", "amylase", "lipase", "data", "created_at") VALUES
	('38bfebf6-0e38-4174-bd1c-f77dc31000ff', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 2880, true, 125, 3.7, 94, 25, 1.1, 108, 94, 9.1, 1.3, 6.2, 11, 220, 15.2, 46, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.03, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.8, 3.2, NULL, NULL, '{"unstructured": {"pH": "", "BNP": "", "INR": null, "HbA1c": "", "D-Dimer": "", "O2 Sat.": null, "Basophils": "", "Monocytes": "6", "Eosinophils": "", "Lymphocytes": "20", "Neutrophils": "72", "Procalcitonin": ""}}', '2026-03-19 21:05:12.560184+00'),
	('112ff01d-b6d4-444c-b0da-a1b2da55d3f4', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 1440, true, 129, 3.6, 95, 28, 1.2, 118, NULL, NULL, NULL, NULL, 13.5, 210, 15, 45, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"unstructured": {"pH": null, "BNP": null, "INR": null, "HbA1c": "", "D-Dimer": null, "O2 Sat.": null, "Basophils": "", "Monocytes": "", "Eosinophils": "", "Lymphocytes": "", "Neutrophils": "78", "Procalcitonin": null}}', '2026-03-19 21:05:12.560184+00'),
	('ca69c267-a116-48a6-b5e3-5185dd8ea22c', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 120, true, 126, 3.5, 93, 32, 1.4, 130, NULL, NULL, 2.4, NULL, 18.5, 200, 14.8, 44, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"unstructured": {"pH": null, "BNP": null, "INR": null, "HbA1c": null, "D-Dimer": null, "O2 Sat.": null, "Basophils": null, "Monocytes": "", "Eosinophils": "", "Lymphocytes": "", "Neutrophils": "85", "Procalcitonin": null}}', '2026-03-19 21:05:12.560184+00'),
	('9e9200d4-965b-4753-bb0e-58568774be55', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 0, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"unstructured": {"pH": null, "BNP": "", "INR": null, "HbA1c": "", "D-Dimer": "", "O2 Sat.": null, "Basophils": "", "Monocytes": "", "Eosinophils": "", "Lymphocytes": "", "Neutrophils": "", "Procalcitonin": ""}}', '2026-03-19 21:05:12.560184+00');


INSERT INTO "public"."orders" ("id", "case_id", "category", "title", "details", "status", "provider", "is_important", "is_in_presim", "created_at") VALUES
	('99408d41-fc72-4933-b27f-47a81361c4ef', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Laboratory', 'Basic Metabolic Panel (BMP)', 'Collect Basic Metabolic Panel (BMP).', 'Active', 'Dr. John Smith, MD', true, true, '2026-03-19 20:52:48.147762+00'),
	('be6fe6d6-222f-4ec9-a590-377e2f23c24b', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Laboratory', 'Complete Blood Count (CBC)', 'Collect Complete Blood Count (CBC).', 'Active', 'Dr. John Smith, MD', true, true, '2026-03-19 20:52:48.147762+00'),
	('6da9a8d4-53bf-4a99-8aef-3371d24389cd', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Respiratory', 'Incentive Spirometry', 'Instruct patient to use incentive spirometer 10 times per hour while awake. Document effort and results', 'Active', 'Dr. Azzedine Habz', false, true, '2026-03-19 20:52:48.147762+00'),
	('953bc3d3-4617-4bc4-a3c5-c96cf317abc7', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Nursing', 'Vital Signs Monitoring (q4h)', 'Monitor BP, HR, RR, Temp, SpO₂ every 4 hours. Notify provider for Temp > 38.0°C (100.4°F), Systolic BP > 160 mmHg or < 100 mmHg, HR > 110 bpm or < 50 bpm.', 'Active', 'Dr. John Smith, MD', true, true, '2026-03-19 20:52:48.147762+00'),
	('6e3c426b-9b7f-4a14-a5d8-b0dc49b9076c', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Nursing', 'Insert and Maintain IV', '', 'Active', 'Dr. John Smith, MD', true, true, '2026-03-19 20:52:48.147762+00'),
	('0b4cf35b-8ee9-4298-974e-12994cc8a082', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Nursing', 'Activity: As Tolerated', 'Encourage patient activity as tolerated. Assist with ambulation as needed.', 'Active', 'Dr. John Smith, MD', false, true, '2026-03-19 20:52:48.147762+00'),
	('10c9db54-63cf-4bce-88c6-e0751914dd9c', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Nursing', 'Fall Risk Precautions', 'Implement standard fall risk protocol. Ensure bed in low position and call light within reach.', 'Active', 'Dr. John Smith, MD', false, true, '2026-03-19 20:52:48.147762+00'),
	('8572aa2e-1e38-40ee-8b3f-1088e8e638f6', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Respiratory', 'Oxygen Therapy', 'Titrate oxygen via nasal cannula to maintain SpO₂ ≥ 95%.', 'Active', 'Dr. Chen', false, true, '2026-03-19 20:52:48.147762+00'),
	('5dfe30af-8171-43a8-a239-d9f90dfb4899', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Nursing', 'Cardiac Monitoring', 'Acute Electrolyte imbalance', 'Active', 'Dr. Chen', true, true, '2026-03-19 20:52:48.147762+00'),
	('f3fef073-c341-4f83-a26d-fe314e5023d0', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Nursing', 'I&O', 'q8hr', 'Active', 'Dr. Chen', true, true, '2026-03-19 20:52:48.147762+00'),
	('e3705f20-28af-43e0-a5bf-f0863fca775e', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Nursing', 'Orthostatic Vitals', 'Document BP & HR with patient supine, sitting, standing. Perform daily.', 'Active', 'Dr. Chen', true, true, '2026-03-19 20:52:48.147762+00'),
	('a49dc81b-1845-4b24-ab9e-9284db141f27', '2e66e8e8-8052-4561-bfb6-f59f3b4ac0fc', 'Diet', 'Diet', 'Heart Healthy. 2L Fluid Restriction. ', 'Active', 'Dr. Chen', true, true, '2026-03-19 20:52:48.147762+00');


SELECT pg_catalog.setval('"public"."dispense_units_id_seq"', 18, true);


RESET ALL;
