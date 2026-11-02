UPDATE users SET role = 'admin' where full_name = 'Matt Smith';

INSERT INTO group_members (student_id, group_id) VALUES ((SELECT id from users where full_name = 'Matt Smith'),'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d');

INSERT INTO group_members (student_id, group_id) VALUES ((SELECT id from users where full_name = 'Matthew Smith'),'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d');

INSERT INTO group_members (student_id, group_id) VALUES ((SELECT id from users where full_name = 'matt smith'),'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2d');

UPDATE group_members SET active = false WHERE student_id = 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b' AND group_id =  'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e2b';
SELECT 1 FROM group_members WHERE active = false;