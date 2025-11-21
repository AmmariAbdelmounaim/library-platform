-- ===============================================
-- 002_membership_cards.sql
-- Seed initial membership cards
-- ===============================================

-- Insert free membership cards
INSERT INTO membership_cards(serial_number, status)
VALUES
    ('BB000000001', 'FREE'),
    ('BB000000002', 'FREE'),
    ('BB000000003', 'FREE'),
    ('BB000000004', 'FREE'),
    ('BB000000005', 'FREE'),
    ('BB000000006', 'FREE'),
    ('BB000000007', 'FREE'),
    ('BB000000008', 'FREE'),
    ('BB000000009', 'FREE'),
    ('BB000000010', 'FREE')
ON CONFLICT (serial_number) DO NOTHING;

-- Log seed completion
DO $$
BEGIN
    RAISE NOTICE '✓ Membership cards seeded successfully';
END $$;

