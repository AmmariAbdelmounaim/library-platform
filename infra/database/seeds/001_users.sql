-- ===============================================
-- 001_users.sql
-- Seed initial user data
-- ===============================================

-- Insert admin user
INSERT INTO users(email, first_name, last_name, role, password)
VALUES ('admin@library.com', 'Admin', 'User', 'ADMIN', "password")
ON CONFLICT (email) DO NOTHING;

-- Log seed completion
DO $$
BEGIN
    RAISE NOTICE '✓ Users seeded successfully';
END $$;

