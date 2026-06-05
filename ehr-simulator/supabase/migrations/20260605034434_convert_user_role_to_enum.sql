-- 1. Create the enum type
CREATE TYPE user_role AS ENUM ('student', 'admin', 'faculty');

-- 2. Add a new enum column
ALTER TABLE users ADD COLUMN role_new user_role;

-- 3. Backfill it from the existing string column
UPDATE users SET role_new = role::user_role;

-- 4. Make it NOT NULL if your current column is NOT NULL
ALTER TABLE users ALTER COLUMN role_new SET NOT NULL;

-- 5. Drop the old column and rename the new one
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users RENAME COLUMN role_new TO role;