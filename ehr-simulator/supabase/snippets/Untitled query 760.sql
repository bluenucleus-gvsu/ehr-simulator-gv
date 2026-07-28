UPDATE users SET role = 'admin' where full_name = 'Matt Smith';

INSERT INTO group_members (student_id, group_id) VALUES ((SELECT id from users where full_name = 'Matt Smith'),'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d');

INSERT INTO group_members (student_id, group_id) VALUES ((SELECT id from users where full_name = 'Matthew Smith'),'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d');

UPDATE public.users SET role = 'admin' where full_name = 'Matt Smith';

INSERT INTO course_cases (case_id, course_id) VALUES 
((SELECT id from cases where first_name = 'Harold'), (select id from courses where code = 'NUR 380'))
