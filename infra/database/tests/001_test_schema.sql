-- ===============================================
-- TEST 001: Schema and Basic Table Operations
-- ===============================================

\echo '========================================='
\echo 'TEST 001: Schema and Basic Table Tests'
\echo '========================================='

-- Start transaction for rollback
BEGIN;

-- ========== TEST: ENUM TYPES ==========
\echo ''
\echo 'TEST: Verify ENUM types exist'
DO $$
BEGIN
    ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'card_status')), 'card_status enum missing';
    ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status')), 'loan_status enum missing';
    ASSERT (SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role')), 'user_role enum missing';
    RAISE NOTICE '✓ All ENUM types exist';
END $$;

-- ========== TEST: USERS TABLE ==========
\echo ''
\echo 'TEST: Users table operations'

-- Insert valid user
INSERT INTO users (email, first_name, last_name, role) 
VALUES ('test1@example.com', 'John', 'Doe', 'USER')
RETURNING id, email, role;

-- Test unique email constraint
DO $$
BEGIN
    BEGIN
        INSERT INTO users (email, first_name, last_name) 
        VALUES ('test1@example.com', 'Jane', 'Doe');
        RAISE EXCEPTION 'Should have failed: duplicate email';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✓ Unique email constraint works';
    END;
END $$;

-- Test default values
DO $$
DECLARE
    v_user users;
BEGIN
    INSERT INTO users (email, first_name, last_name)
    VALUES ('test2@example.com', 'Jane', 'Smith')
    RETURNING * INTO v_user;
    
    ASSERT v_user.role = 'USER', 'Default role should be USER';
    ASSERT v_user.created_at IS NOT NULL, 'created_at should be set';
    ASSERT v_user.updated_at IS NOT NULL, 'updated_at should be set';
    RAISE NOTICE '✓ Users table defaults work correctly';
END $$;

-- ========== TEST: AUTHORS TABLE ==========
\echo ''
\echo 'TEST: Authors table operations'

INSERT INTO authors (first_name, last_name, birth_date)
VALUES 
    ('J.K.', 'Rowling', '1965-07-31'),
    ('George', 'Orwell', '1903-06-25')
RETURNING id, first_name, last_name;

DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM authors) >= 2, 'Authors should be inserted';
    RAISE NOTICE '✓ Authors table works correctly';
END $$;

-- ========== TEST: BOOKS TABLE ==========
\echo ''
\echo 'TEST: Books table operations'

INSERT INTO books (title, isbn_13, genre, publication_date)
VALUES 
    ('Harry Potter and the Philosopher''s Stone', '9780747532699', 'Fantasy', '1997-06-26'),
    ('1984', '9780451524935', 'Dystopian', '1949-06-08')
RETURNING id, title, isbn_13;

-- Test unique ISBN constraint
DO $$
BEGIN
    BEGIN
        INSERT INTO books (title, isbn_13, genre)
        VALUES ('Duplicate ISBN Book', '9780747532699', 'Fiction');
        RAISE EXCEPTION 'Should have failed: duplicate ISBN';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✓ Unique ISBN constraint works';
    END;
END $$;

-- ========== TEST: BOOK_AUTHORS JOIN TABLE ==========
\echo ''
\echo 'TEST: Book-Authors relationship'

DO $$
DECLARE
    v_book_id BIGINT;
    v_author_id BIGINT;
BEGIN
    SELECT id INTO v_book_id FROM books WHERE title LIKE 'Harry Potter%' LIMIT 1;
    SELECT id INTO v_author_id FROM authors WHERE last_name = 'Rowling' LIMIT 1;
    
    INSERT INTO book_authors (book_id, author_id)
    VALUES (v_book_id, v_author_id);
    
    ASSERT (SELECT COUNT(*) FROM book_authors WHERE book_id = v_book_id) = 1,
        'Book-author relationship should exist';
    RAISE NOTICE '✓ Book-Authors relationship works';
END $$;

-- Test cascade delete
DO $$
DECLARE
    v_author_id BIGINT;
    v_count INT;
BEGIN
    -- Create temporary author and book
    INSERT INTO authors (first_name, last_name)
    VALUES ('Test', 'Author') RETURNING id INTO v_author_id;
    
    INSERT INTO books (title, isbn_13)
    VALUES ('Test Book', '9999999999999');
    
    INSERT INTO book_authors (book_id, author_id)
    SELECT b.id, v_author_id 
    FROM books b WHERE b.title = 'Test Book';
    
    -- Delete author, should cascade
    DELETE FROM authors WHERE id = v_author_id;
    
    SELECT COUNT(*) INTO v_count 
    FROM book_authors WHERE author_id = v_author_id;
    
    ASSERT v_count = 0, 'Cascade delete should remove book_authors entries';
    RAISE NOTICE '✓ Cascade delete works on book_authors';
END $$;

-- ========== TEST: MEMBERSHIP CARDS TABLE ==========
\echo ''
\echo 'TEST: Membership cards table operations'

INSERT INTO membership_cards (serial_number, status)
VALUES 
    ('CARD-001', 'FREE'),
    ('CARD-002', 'FREE'),
    ('CARD-003', 'FREE')
RETURNING id, serial_number, status;

-- Test unique serial number
DO $$
BEGIN
    BEGIN
        INSERT INTO membership_cards (serial_number, status)
        VALUES ('CARD-001', 'FREE');
        RAISE EXCEPTION 'Should have failed: duplicate serial number';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✓ Unique serial number constraint works';
    END;
END $$;

-- Test one active card per user constraint
DO $$
DECLARE
    v_user_id BIGINT;
    v_card1_id BIGINT;
    v_card2_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'test1@example.com';
    SELECT id INTO v_card1_id FROM membership_cards WHERE serial_number = 'CARD-001';
    SELECT id INTO v_card2_id FROM membership_cards WHERE serial_number = 'CARD-002';
    
    -- Assign first card
    UPDATE membership_cards 
    SET status = 'IN_USE', user_id = v_user_id, assigned_at = NOW()
    WHERE id = v_card1_id;
    
    -- Try to assign second card to same user
    BEGIN
        UPDATE membership_cards 
        SET status = 'IN_USE', user_id = v_user_id, assigned_at = NOW()
        WHERE id = v_card2_id;
        RAISE EXCEPTION 'Should have failed: one active card per user';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✓ One active card per user constraint works';
    END;
END $$;

-- ========== TEST: LOANS TABLE ==========
\echo ''
\echo 'TEST: Loans table operations'

DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
    v_loan_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'test2@example.com';
    SELECT id INTO v_book_id FROM books WHERE title = '1984';
    
    -- Create loan
    INSERT INTO loans (user_id, book_id, status, borrowed_at, due_at)
    VALUES (v_user_id, v_book_id, 'ONGOING', NOW(), NOW() + INTERVAL '21 days')
    RETURNING id INTO v_loan_id;
    
    ASSERT v_loan_id IS NOT NULL, 'Loan should be created';
    RAISE NOTICE '✓ Loans table works correctly';
END $$;

-- Test one ongoing loan per book constraint
DO $$
DECLARE
    v_user_id BIGINT;
    v_book_id BIGINT;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'test1@example.com';
    SELECT id INTO v_book_id FROM books WHERE title = '1984';
    
    BEGIN
        INSERT INTO loans (user_id, book_id, status, borrowed_at, due_at)
        VALUES (v_user_id, v_book_id, 'ONGOING', NOW(), NOW() + INTERVAL '21 days');
        RAISE EXCEPTION 'Should have failed: book already loaned';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✓ One ongoing loan per book constraint works';
    END;
END $$;

-- ========== TEST: INDEXES ==========
\echo ''
\echo 'TEST: Verify all indexes exist'

DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname IN (
        'idx_users_role',
        'idx_authors_last_name',
        'idx_membership_cards_status_serial',
        'uniq_membership_cards_user_active',
        'uniq_books_isbn_13',
        'idx_books_genre',
        'idx_books_search_vector',
        'idx_loans_user_id',
        'uniq_loans_book_ongoing'
    );
    
    ASSERT v_count = 9, FORMAT('Expected 9 indexes, found %s', v_count);
    RAISE NOTICE '✓ All indexes exist';
END $$;

\echo ''
\echo '========================================='
\echo 'TEST 001: PASSED ✓'
\echo '========================================='

ROLLBACK;

