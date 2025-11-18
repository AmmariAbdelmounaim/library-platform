-- ===============================================
-- TEST 003: Business Functions
-- ===============================================

\echo '========================================='
\echo 'TEST 003: Business Function Tests'
\echo '========================================='

BEGIN;

-- Setup test data
DO $$
BEGIN
    -- Clean up any existing free cards from seed data
    DELETE FROM membership_cards WHERE status = 'FREE';
    
    -- Create users
    INSERT INTO users (email, first_name, last_name, role)
    VALUES 
        ('func_user1@example.com', 'Function', 'User1', 'USER'),
        ('func_user2@example.com', 'Function', 'User2', 'USER'),
        ('func_admin@example.com', 'Function', 'Admin', 'ADMIN');
    
    -- Create membership cards (only 2, so we can test running out)
    INSERT INTO membership_cards (serial_number, status)
    VALUES 
        ('FUNC-CARD-001', 'FREE'),
        ('FUNC-CARD-002', 'FREE');
    
    -- Create books
    INSERT INTO books (title, isbn_13)
    VALUES 
        ('Test Book 1', '4444444444444'),
        ('Test Book 2', '5555555555555'),
        ('Test Book 3', '6666666666666');
END $$;

-- ========== TEST: assign_membership_card() ==========
\echo ''
\echo 'TEST: assign_membership_card() function'

DO $$
DECLARE
    v_user_id BIGINT;
    v_card membership_cards;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user1@example.com';
    
    -- Assign card to user
    SELECT * INTO v_card FROM assign_membership_card(v_user_id);
    
    ASSERT v_card.user_id = v_user_id, 'Card should be assigned to user';
    ASSERT v_card.status = 'IN_USE', 'Card status should be IN_USE';
    ASSERT v_card.assigned_at IS NOT NULL, 'assigned_at should be set';
    RAISE NOTICE '✓ assign_membership_card() works correctly';
END $$;

-- Test: Can't assign second card to same user
\echo ''
\echo 'TEST: assign_membership_card() - prevent double assignment'

DO $$
DECLARE
    v_user_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user1@example.com';
    
    BEGIN
        PERFORM assign_membership_card(v_user_id);
        RAISE EXCEPTION 'Should have failed: user already has active card';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%already has an active membership card%' THEN
            RAISE NOTICE '✓ Correctly prevents double card assignment';
        ELSE
            RAISE;
        END IF;
    END;
END $$;

-- Test: No free cards available
\echo ''
\echo 'TEST: assign_membership_card() - handle no free cards'

DO $$
DECLARE
    v_user_id BIGINT;
BEGIN
    -- Assign all remaining free cards
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user2@example.com';
    PERFORM assign_membership_card(v_user_id);
    
    -- Try to assign when no cards available
    SELECT id INTO v_user_id FROM users WHERE email = 'func_admin@example.com';
    
    BEGIN
        PERFORM assign_membership_card(v_user_id);
        RAISE EXCEPTION 'Should have failed: no free cards';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%No FREE membership cards available%' THEN
            RAISE NOTICE '✓ Correctly handles no free cards';
        ELSE
            RAISE;
        END IF;
    END;
END $$;

-- ========== TEST: borrow_book() ==========
\echo ''
\echo 'TEST: borrow_book() function'

DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
    v_loan loans;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user1@example.com';
    SELECT id INTO v_book_id FROM books WHERE isbn_13 = '4444444444444';
    
    -- Borrow book
    SELECT * INTO v_loan FROM borrow_book(v_user_id, v_book_id);
    
    ASSERT v_loan.user_id = v_user_id, 'Loan should be for correct user';
    ASSERT v_loan.book_id = v_book_id, 'Loan should be for correct book';
    ASSERT v_loan.status = 'ONGOING', 'Loan status should be ONGOING';
    ASSERT v_loan.borrowed_at IS NOT NULL, 'borrowed_at should be set';
    ASSERT v_loan.due_at IS NOT NULL, 'due_at should be set';
    ASSERT v_loan.due_at > v_loan.borrowed_at, 'due_at should be after borrowed_at';
    RAISE NOTICE '✓ borrow_book() works correctly';
END $$;

-- Test: Can't borrow already borrowed book
\echo ''
\echo 'TEST: borrow_book() - prevent double borrow'

DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user2@example.com';
    SELECT id INTO v_book_id FROM books WHERE isbn_13 = '4444444444444';
    
    BEGIN
        PERFORM borrow_book(v_user_id, v_book_id);
        RAISE EXCEPTION 'Should have failed: book already borrowed';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Book is already borrowed%' THEN
            RAISE NOTICE '✓ Correctly prevents borrowing already borrowed book';
        ELSE
            RAISE;
        END IF;
    END;
END $$;

-- Test: Max loans limit
\echo ''
\echo 'TEST: borrow_book() - max loans limit'

DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
    i INT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user2@example.com';
    
    -- Borrow 5 books (max limit)
    FOR i IN 1..5 LOOP
        INSERT INTO books (title, isbn_13)
        VALUES (FORMAT('Max Loan Book %s', i), FORMAT('777777777%s', LPAD(i::text, 4, '0')))
        RETURNING id INTO v_book_id;
        
        PERFORM borrow_book(v_user_id, v_book_id);
    END LOOP;
    
    -- Try to borrow 6th book
    SELECT id INTO v_book_id FROM books WHERE isbn_13 = '5555555555555';
    
    BEGIN
        PERFORM borrow_book(v_user_id, v_book_id);
        RAISE EXCEPTION 'Should have failed: max loans reached';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Max active loans%' THEN
            RAISE NOTICE '✓ Correctly enforces max loans limit';
        ELSE
            RAISE;
        END IF;
    END;
END $$;

-- ========== TEST: return_book() ==========
\echo ''
\echo 'TEST: return_book() function'

DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
    v_loan loans;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user1@example.com';
    SELECT id INTO v_book_id FROM books WHERE isbn_13 = '4444444444444';
    
    -- Return book
    SELECT * INTO v_loan FROM return_book(v_user_id, v_book_id);
    
    ASSERT v_loan.status = 'RETURNED', 'Loan status should be RETURNED';
    ASSERT v_loan.returned_at IS NOT NULL, 'returned_at should be set';
    RAISE NOTICE '✓ return_book() works correctly';
    
    -- Verify book can be borrowed again
    SELECT id INTO v_user_id FROM users WHERE email = 'func_admin@example.com';
    PERFORM borrow_book(v_user_id, v_book_id);
    RAISE NOTICE '✓ Returned book can be borrowed again';
END $$;

-- Test: Can't return non-borrowed book
\echo ''
\echo 'TEST: return_book() - handle non-existent loan'

DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user1@example.com';
    SELECT id INTO v_book_id FROM books WHERE isbn_13 = '6666666666666';
    
    BEGIN
        PERFORM return_book(v_user_id, v_book_id);
        RAISE EXCEPTION 'Should have failed: no ongoing loan';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%No ongoing loan found%' THEN
            RAISE NOTICE '✓ Correctly handles non-existent loan';
        ELSE
            RAISE;
        END IF;
    END;
END $$;

-- ========== TEST: set_app_context() ==========
\echo ''
\echo 'TEST: set_app_context() function'

DO $$
DECLARE
    v_user_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'func_user1@example.com';
    
    -- Set context
    PERFORM set_app_context(v_user_id, 'USER');
    
    ASSERT current_setting('app.current_user_id', true) = v_user_id::text, 
        'User ID should be set in context';
    ASSERT current_setting('app.current_user_role', true) = 'USER', 
        'User role should be set in context';
    
    RAISE NOTICE '✓ set_app_context() works correctly';
END $$;

\echo ''
\echo '========================================='
\echo 'TEST 003: PASSED ✓'
\echo '========================================='

ROLLBACK;

