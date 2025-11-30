-- Fix inconsistent role names in database
-- Update any roles that have uppercase names to match the enum

-- Update HR role from 'HR' to 'hr'
UPDATE roles SET name = 'hr' WHERE name = 'HR';

-- Update ADMIN role from 'ADMIN' to 'admin' (if exists)
UPDATE roles SET name = 'admin' WHERE name = 'ADMIN';

-- Update EMPLOYER role from 'EMPLOYER' to 'employer' (if exists)
UPDATE roles SET name = 'employer' WHERE name = 'EMPLOYER';

-- Update JOB_SEEKER role from 'JOB_SEEKER' to 'job_seeker' (if exists)
UPDATE roles SET name = 'job_seeker' WHERE name = 'JOB_SEEKER';

-- Verify the changes
SELECT id, name, description FROM roles ORDER BY name;
