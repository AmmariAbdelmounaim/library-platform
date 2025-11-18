-- ===============================================
-- 001_create_enums.sql
-- Create enum types for the library platform
-- ===============================================

-- Card status enumeration
CREATE TYPE card_status AS ENUM ('FREE', 'IN_USE', 'ARCHIVED');

-- Loan status enumeration
CREATE TYPE loan_status AS ENUM ('ONGOING', 'RETURNED', 'LATE');

-- User role enumeration
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');

-- Log enum creation
DO $$
BEGIN
    RAISE NOTICE '✓ Enum types created successfully';
END $$;

