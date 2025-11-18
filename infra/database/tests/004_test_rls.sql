-- ===============================================
-- TEST 004: Row Level Security (RLS) Policies
-- ===============================================

\echo '========================================='
\echo 'TEST 004: RLS Policy Tests'
\echo '========================================='

BEGIN;

-- Setup test data
DO $$
BEGIN
    -- Create test users
    INSERT INTO users (id, email, first_name, last_name, role)
    VALUES 
        (1001, 'rls_user1@example.com', 'RLS', 'User1', 'USER'),
        (1002, 'rls_user2@example.com', 'RLS', 'User2', 'USER'),
        (1003, 'rls_admin@example.com', 'RLS', 'Admin', 'ADMIN');
    
    -- Create books
    INSERT INTO books (id, title, isbn_13)
    VALUES 
        (2001, 'RLS Book 1', '8888888888881'),
        (2002, 'RLS Book 2', '8888888888882');
    
    -- Create loans
    INSERT INTO loans (user_id, book_id, status)
    VALUES 
        (1001, 2001, 'ONGOING'),
        (1002, 2002, 'ONGOING');
    
    -- Create membership cards
    INSERT INTO membership_cards (serial_number, status, user_id)
    VALUES 
        ('RLS-CARD-001', 'IN_USE', 1001);
END $$;

-- Get the app role name
\set app_role `echo ${DB_APP_ROLE:-library_app}`

-- ========== TEST: RLS is enabled ==========
\echo ''
\echo 'TEST: Verify RLS is enabled on tables'

DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('users', 'books', 'loans', 'membership_cards')
      AND rowsecurity = true;
    
    ASSERT v_count = 4, FORMAT('Expected RLS on 4 tables, found %s', v_count);
    RAISE NOTICE '✓ RLS is enabled on all required tables';
END $$;

-- ========== TEST: USERS RLS Policies ==========
\echo ''
\echo 'TEST: Users RLS - user can see self'

DO $$
DECLARE
    v_count INT;
BEGIN
    -- Set context as user1
    PERFORM set_app_context(1001, 'USER');
    
    -- Switch to app role for RLS
    SET LOCAL ROLE library_app;
    
    -- Should see own record
    SELECT COUNT(*) INTO v_count FROM users WHERE id = 1001;
    ASSERT v_count = 1, 'User should see own record';
    
    -- Should NOT see other user
    SELECT COUNT(*) INTO v_count FROM users WHERE id = 1002;
    ASSERT v_count = 0, 'User should NOT see other user';
    
    RESET ROLE;
    RAISE NOTICE '✓ Users can see only themselves';
END $$;

\echo ''
\echo 'TEST: Users RLS - admin can see all'

DO $$
DECLARE
    v_count INT;
BEGIN
    -- Set context as admin
    PERFORM set_app_context(1003, 'ADMIN');
    
    SET LOCAL ROLE library_app;
    
    -- Admin should see all users
    SELECT COUNT(*) INTO v_count FROM users WHERE id IN (1001, 1002, 1003);
    ASSERT v_count = 3, 'Admin should see all users';
    
    RESET ROLE;
    RAISE NOTICE '✓ Admin can see all users';
END $$;

\echo ''
\echo 'TEST: Users RLS - only admin can insert'

DO $$
BEGIN
    -- Try as regular user
    PERFORM set_app_context(1001, 'USER');
    SET LOCAL ROLE library_app;
    
    BEGIN
        INSERT INTO users (email, first_name, last_name, role)
        VALUES ('rls_test@example.com', 'Test', 'User', 'USER');
        RAISE EXCEPTION 'Should have failed: user cannot insert';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE '✓ Regular user cannot insert users';
    END;
    
    RESET ROLE;
END $$;

DO $$
BEGIN
    -- Try as admin
    PERFORM set_app_context(1003, 'ADMIN');
    SET LOCAL ROLE library_app;
    
    INSERT INTO users (email, first_name, last_name, role)
    VALUES ('rls_admin_insert@example.com', 'Admin', 'Insert', 'USER');
    
    RESET ROLE;
    RAISE NOTICE '✓ Admin can insert users';
END $$;

-- ========== TEST: BOOKS RLS Policies ==========
\echo ''
\echo 'TEST: Books RLS - all can read'

DO $$
DECLARE
    v_count INT;
BEGIN
    PERFORM set_app_context(1001, 'USER');
    SET LOCAL ROLE library_app;
    
    SELECT COUNT(*) INTO v_count FROM books WHERE id IN (2001, 2002);
    ASSERT v_count = 2, 'User should see all books';
    
    RESET ROLE;
    RAISE NOTICE '✓ All users can read books';
END $$;

\echo ''
\echo 'TEST: Books RLS - only admin can modify'

DO $$
BEGIN
    PERFORM set_app_context(1001, 'USER');
    SET LOCAL ROLE library_app;
    
    BEGIN
        INSERT INTO books (title, isbn_13)
        VALUES ('User Insert Book', '9999999999991');
        RAISE EXCEPTION 'Should have failed: user cannot insert books';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE '✓ Regular user cannot insert books';
    END;
    
    RESET ROLE;
END $$;

DO $$
BEGIN
    PERFORM set_app_context(1003, 'ADMIN');
    SET LOCAL ROLE library_app;
    
    INSERT INTO books (title, isbn_13)
    VALUES ('Admin Insert Book', '9999999999992');
    
    UPDATE books SET title = 'Admin Updated Book' WHERE isbn_13 = '9999999999992';
    
    RESET ROLE;
    RAISE NOTICE '✓ Admin can insert and update books';
END $$;

-- ========== TEST: LOANS RLS Policies ==========
\echo ''
\echo 'TEST: Loans RLS - user can see own loans'

DO $$
DECLARE
    v_count INT;
BEGIN
    PERFORM set_app_context(1001, 'USER');
    SET LOCAL ROLE library_app;
    
    -- Should see own loan
    SELECT COUNT(*) INTO v_count FROM loans WHERE user_id = 1001;
    ASSERT v_count = 1, 'User should see own loan';
    
    -- Should NOT see other user's loan
    SELECT COUNT(*) INTO v_count FROM loans WHERE user_id = 1002;
    ASSERT v_count = 0, 'User should NOT see other user loans';
    
    RESET ROLE;
    RAISE NOTICE '✓ Users can see only own loans';
END $$;

\echo ''
\echo 'TEST: Loans RLS - admin can see all loans'

DO $$
DECLARE
    v_count INT;
BEGIN
    PERFORM set_app_context(1003, 'ADMIN');
    SET LOCAL ROLE library_app;
    
    SELECT COUNT(*) INTO v_count FROM loans WHERE user_id IN (1001, 1002);
    ASSERT v_count = 2, 'Admin should see all loans';
    
    RESET ROLE;
    RAISE NOTICE '✓ Admin can see all loans';
END $$;

-- ========== TEST: MEMBERSHIP_CARDS RLS Policies ==========
\echo ''
\echo 'TEST: Membership Cards RLS - all can read'

DO $$
DECLARE
    v_count INT;
BEGIN
    PERFORM set_app_context(1001, 'USER');
    SET LOCAL ROLE library_app;
    
    SELECT COUNT(*) INTO v_count FROM membership_cards WHERE serial_number = 'RLS-CARD-001';
    ASSERT v_count = 1, 'User should see membership cards';
    
    RESET ROLE;
    RAISE NOTICE '✓ All users can read membership cards';
END $$;

\echo ''
\echo 'TEST: Membership Cards RLS - only admin can modify'

DO $$
DECLARE
    v_rows INT;
BEGIN
    PERFORM set_app_context(1001, 'USER');
    SET LOCAL ROLE library_app;
    
    -- Try to update - RLS will block access to rows, so 0 rows will be updated
    UPDATE membership_cards 
    SET status = 'ARCHIVED' 
    WHERE serial_number = 'RLS-CARD-001';
    
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    ASSERT v_rows = 0, 'Should not have updated any rows';
    RAISE NOTICE '✓ Regular user cannot update membership cards';
    
    RESET ROLE;
END $$;

DO $$
BEGIN
    PERFORM set_app_context(1003, 'ADMIN');
    SET LOCAL ROLE library_app;
    
    INSERT INTO membership_cards (serial_number, status)
    VALUES ('RLS-ADMIN-CARD', 'FREE');
    
    UPDATE membership_cards 
    SET status = 'ARCHIVED' 
    WHERE serial_number = 'RLS-ADMIN-CARD';
    
    RESET ROLE;
    RAISE NOTICE '✓ Admin can insert and update membership cards';
END $$;

\echo ''
\echo '========================================='
\echo 'TEST 004: PASSED ✓'
\echo '========================================='

ROLLBACK;

