-- ===============================================
-- TEST 002: Triggers
-- ===============================================

\echo '========================================='
\echo 'TEST 002: Trigger Tests'
\echo '========================================='

BEGIN;

-- ========== TEST: updated_at TRIGGER ==========
\echo ''
\echo 'TEST: updated_at trigger on users'

DO $$
DECLARE
    v_user_id BIGINT;
    v_created_at TIMESTAMPTZ;
    v_updated_at TIMESTAMPTZ;
    v_new_updated_at TIMESTAMPTZ;
BEGIN
    -- Create user
    INSERT INTO users (email, first_name, last_name)
    VALUES ('trigger_test@example.com', 'Trigger', 'Test')
    RETURNING id, created_at, updated_at INTO v_user_id, v_created_at, v_updated_at;
    
    ASSERT v_created_at = v_updated_at, 'created_at and updated_at should match initially';
    
    -- Wait a tiny bit and update
    PERFORM pg_sleep(0.1);
    
    UPDATE users 
    SET first_name = 'Updated'
    WHERE id = v_user_id
    RETURNING updated_at INTO v_new_updated_at;
    
    ASSERT v_new_updated_at > v_updated_at, 'updated_at should be refreshed';
    RAISE NOTICE '✓ updated_at trigger works on users';
END $$;

-- ========== TEST: updated_at TRIGGER on other tables ==========
\echo ''
\echo 'TEST: updated_at trigger on books'

DO $$
DECLARE
    v_book_id BIGINT;
    v_old_updated_at TIMESTAMPTZ;
    v_new_updated_at TIMESTAMPTZ;
BEGIN
    INSERT INTO books (title, isbn_13)
    VALUES ('Trigger Book', '1111111111111')
    RETURNING id, updated_at INTO v_book_id, v_old_updated_at;
    
    PERFORM pg_sleep(0.1);
    
    UPDATE books 
    SET title = 'Updated Trigger Book'
    WHERE id = v_book_id
    RETURNING updated_at INTO v_new_updated_at;
    
    ASSERT v_new_updated_at > v_old_updated_at, 'updated_at should be refreshed on books';
    RAISE NOTICE '✓ updated_at trigger works on books';
END $$;

\echo ''
\echo 'TEST: updated_at trigger on authors'

DO $$
DECLARE
    v_author_id BIGINT;
    v_old_updated_at TIMESTAMPTZ;
    v_new_updated_at TIMESTAMPTZ;
BEGIN
    INSERT INTO authors (first_name, last_name)
    VALUES ('Trigger', 'Author')
    RETURNING id, updated_at INTO v_author_id, v_old_updated_at;
    
    PERFORM pg_sleep(0.1);
    
    UPDATE authors 
    SET first_name = 'Updated'
    WHERE id = v_author_id
    RETURNING updated_at INTO v_new_updated_at;
    
    ASSERT v_new_updated_at > v_old_updated_at, 'updated_at should be refreshed on authors';
    RAISE NOTICE '✓ updated_at trigger works on authors';
END $$;

\echo ''
\echo 'TEST: updated_at trigger on loans'

DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
    v_loan_id BIGINT;
    v_old_updated_at TIMESTAMPTZ;
    v_new_updated_at TIMESTAMPTZ;
BEGIN
    INSERT INTO users (email, first_name, last_name)
    VALUES ('loan_trigger@example.com', 'Loan', 'User')
    RETURNING id INTO v_user_id;
    
    INSERT INTO books (title, isbn_13)
    VALUES ('Loan Book', '2222222222222')
    RETURNING id INTO v_book_id;
    
    INSERT INTO loans (user_id, book_id, status)
    VALUES (v_user_id, v_book_id, 'ONGOING')
    RETURNING id, updated_at INTO v_loan_id, v_old_updated_at;
    
    PERFORM pg_sleep(0.1);
    
    UPDATE loans 
    SET status = 'RETURNED', returned_at = NOW()
    WHERE id = v_loan_id
    RETURNING updated_at INTO v_new_updated_at;
    
    ASSERT v_new_updated_at > v_old_updated_at, 'updated_at should be refreshed on loans';
    RAISE NOTICE '✓ updated_at trigger works on loans';
END $$;

\echo ''
\echo 'TEST: updated_at trigger on membership_cards'

DO $$
DECLARE
    v_card_id BIGINT;
    v_old_updated_at TIMESTAMPTZ;
    v_new_updated_at TIMESTAMPTZ;
BEGIN
    INSERT INTO membership_cards (serial_number, status)
    VALUES ('TRIGGER-CARD-001', 'FREE')
    RETURNING id, updated_at INTO v_card_id, v_old_updated_at;
    
    PERFORM pg_sleep(0.1);
    
    UPDATE membership_cards 
    SET status = 'ARCHIVED', archived_at = NOW()
    WHERE id = v_card_id
    RETURNING updated_at INTO v_new_updated_at;
    
    ASSERT v_new_updated_at > v_old_updated_at, 'updated_at should be refreshed on membership_cards';
    RAISE NOTICE '✓ updated_at trigger works on membership_cards';
END $$;

-- ========== TEST: search_vector TRIGGER ==========
\echo ''
\echo 'TEST: search_vector trigger on books'

DO $$
DECLARE
    v_book_id BIGINT;
    v_search_vector tsvector;
BEGIN
    -- Insert book with title and description
    INSERT INTO books (title, description, isbn_13)
    VALUES ('The Great Gatsby', 'A story about the mysterious millionaire Jay Gatsby', '3333333333333')
    RETURNING id, search_vector INTO v_book_id, v_search_vector;
    
    ASSERT v_search_vector IS NOT NULL, 'search_vector should be set';
    ASSERT v_search_vector @@ to_tsquery('simple', 'Great'), 'Should match title word';
    ASSERT v_search_vector @@ to_tsquery('simple', 'mysterious'), 'Should match description word';
    RAISE NOTICE '✓ search_vector trigger works on INSERT';
    
    -- Update book
    UPDATE books 
    SET title = 'The Amazing Gatsby'
    WHERE id = v_book_id
    RETURNING search_vector INTO v_search_vector;
    
    ASSERT v_search_vector @@ to_tsquery('simple', 'Amazing'), 'Should match updated title';
    ASSERT NOT (v_search_vector @@ to_tsquery('simple', 'Great')), 'Should not match old title';
    RAISE NOTICE '✓ search_vector trigger works on UPDATE';
END $$;

\echo ''
\echo '========================================='
\echo 'TEST 002: PASSED ✓'
\echo '========================================='

ROLLBACK;

