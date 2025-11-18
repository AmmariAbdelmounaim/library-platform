-- ===============================================
-- 006_create_functions.sql
-- Create business logic functions
-- ===============================================

-- Function to set application context for RLS
CREATE OR REPLACE FUNCTION set_app_context(p_user BIGINT, p_role user_role)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', p_user::text, true);
    PERFORM set_config('app.current_user_role', p_role::text, true);
END;
$$ LANGUAGE plpgsql;

-- Function to assign a membership card to a user
CREATE OR REPLACE FUNCTION assign_membership_card(p_user_id BIGINT)
RETURNS membership_cards AS $$
DECLARE 
    v_card membership_cards;
BEGIN
    -- Check if user already has an active card
    PERFORM 1 FROM membership_cards
    WHERE user_id = p_user_id AND status = 'IN_USE';
    
    IF FOUND THEN
        RAISE EXCEPTION 'User % already has an active membership card', p_user_id;
    END IF;

    -- Find and assign a free card
    WITH cte AS (
        SELECT id FROM membership_cards
        WHERE status = 'FREE'
        ORDER BY serial_number
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    UPDATE membership_cards mc
    SET 
        status = 'IN_USE',
        user_id = p_user_id,
        assigned_at = NOW()
    FROM cte 
    WHERE mc.id = cte.id
    RETURNING mc.* INTO v_card;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No FREE membership cards available';
    END IF;

    RETURN v_card;
END;
$$ LANGUAGE plpgsql;

-- Function to borrow a book
CREATE OR REPLACE FUNCTION borrow_book(p_user_id BIGINT, p_book_id BIGINT)
RETURNS loans AS $$
DECLARE 
    v_loan loans;
    v_max_loans INT := 5;
    v_cnt INT;
BEGIN
    -- Check if user has reached max active loans
    SELECT COUNT(*) INTO v_cnt 
    FROM loans
    WHERE user_id = p_user_id AND returned_at IS NULL;
    
    IF v_cnt >= v_max_loans THEN
        RAISE EXCEPTION 'Max active loans (%) reached', v_max_loans;
    END IF;

    -- Check if book is already borrowed
    PERFORM 1 FROM loans
    WHERE book_id = p_book_id AND returned_at IS NULL;
    
    IF FOUND THEN
        RAISE EXCEPTION 'Book is already borrowed';
    END IF;

    -- Create loan record
    INSERT INTO loans(user_id, book_id, status, borrowed_at, due_at)
    VALUES (
        p_user_id,
        p_book_id,
        'ONGOING',
        NOW(),
        NOW() + INTERVAL '21 days'
    )
    RETURNING * INTO v_loan;

    RETURN v_loan;
END;
$$ LANGUAGE plpgsql;

-- Function to return a book
CREATE OR REPLACE FUNCTION return_book(p_user_id BIGINT, p_book_id BIGINT)
RETURNS loans AS $$
DECLARE 
    v_loan loans;
BEGIN
    -- Mark loan as returned
    UPDATE loans
    SET 
        status = 'RETURNED',
        returned_at = NOW()
    WHERE 
        user_id = p_user_id AND
        book_id = p_book_id AND
        returned_at IS NULL
    RETURNING * INTO v_loan;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No ongoing loan found for user % and book %', p_user_id, p_book_id;
    END IF;

    RETURN v_loan;
END;
$$ LANGUAGE plpgsql;

-- Log function creation
DO $$
BEGIN
    RAISE NOTICE '✓ Business functions created successfully';
END $$;

