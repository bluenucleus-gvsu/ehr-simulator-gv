select * from documentation_results where case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d'

DELETE FROM documentation_results where time_offset in (-10, -20) AND case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d';

UPDATE documentation_results SET agitation = '4' where case_id = 'e5f6a7b8-c9d0-4e5f-4b1a-4c5d6e7f8a9d' AND time_offset = -10;

select * from users

delete from cases where id = 'b93ed9dc-434f-4c51-9c8f-cab69cc52b2c'