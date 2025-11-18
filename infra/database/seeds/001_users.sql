-- ===============================================
-- 001_users.sql
-- Seed initial user data
-- ===============================================

-- Insert admin user
INSERT INTO users(email, first_name, last_name, role)
VALUES ('admin@library.com', 'Admin', 'User', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert regular test users
INSERT INTO users(email, first_name, last_name, role)
VALUES 
    ('john.doe@library.com', 'John', 'Doe', 'USER'),
    ('jane.smith@library.com', 'Jane', 'Smith', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Log seed completion
DO $$
BEGIN
    RAISE NOTICE '✓ Users seeded successfully';
END $$;

