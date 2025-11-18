-- ===============================================
-- Library Platform - Complete Database Schema
-- This is a consolidated view of the entire schema
-- Generated from migrations 001-006
-- ===============================================
-- 
-- NOTE: For production, use migrations in database/migrations/
-- This file is for reference and quick database recreation
--
-- ===============================================

-- ========== ENUMS ==========

CREATE TYPE card_status AS ENUM ('FREE', 'IN_USE', 'ARCHIVED');
CREATE TYPE loan_status AS ENUM ('ONGOING', 'RETURNED', 'LATE');
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');

-- ========== TABLES ==========

-- Users table
CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    email       VARCHAR(255)    UNIQUE NOT NULL,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    role        user_role       NOT NULL DEFAULT 'USER',
    password   VARCHAR(255)     NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Membership cards table
CREATE TABLE membership_cards (
    id            BIGSERIAL     PRIMARY KEY,
    serial_number VARCHAR(20)   UNIQUE NOT NULL,
    status        card_status   NOT NULL DEFAULT 'FREE',
    user_id       BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    assigned_at   TIMESTAMPTZ,
    archived_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Authors table
CREATE TABLE authors (
    id          BIGSERIAL       PRIMARY KEY,
    first_name  VARCHAR(100),
    last_name   VARCHAR(100)    NOT NULL,
    birth_date  DATE,
    death_date  DATE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Books table
CREATE TABLE books (
    id                BIGSERIAL       PRIMARY KEY,
    title             VARCHAR(255)    NOT NULL,
    isbn_10           VARCHAR(10),
    isbn_13           VARCHAR(13),
    genre             VARCHAR(100),
    publication_date  DATE,
    description       TEXT,
    cover_image_url   TEXT,
    external_source   VARCHAR(100),
    external_id       VARCHAR(255),
    external_metadata JSONB,
    search_vector     tsvector,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Book-Authors junction table
CREATE TABLE book_authors (
    book_id   BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

-- Loans table
CREATE TABLE loans (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id     BIGINT          NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status      loan_status     NOT NULL DEFAULT 'ONGOING',
    borrowed_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    due_at      TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ========== INDEXES ==========

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_role ON users(role);

-- Membership cards indexes
CREATE INDEX idx_membership_cards_status_serial
    ON membership_cards (status, serial_number);
CREATE UNIQUE INDEX uniq_membership_cards_user_active
    ON membership_cards (user_id) WHERE status = 'IN_USE';

-- Authors indexes
CREATE INDEX idx_authors_last_name ON authors(last_name);

-- Books indexes
CREATE UNIQUE INDEX uniq_books_isbn_13
    ON books (isbn_13) WHERE isbn_13 IS NOT NULL;
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_search_vector
    ON books USING GIN (search_vector);

-- Loans indexes
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE UNIQUE INDEX uniq_loans_book_ongoing
    ON loans (book_id) WHERE returned_at IS NULL;

-- ========== TRIGGERS ==========

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CLOCK_TIMESTAMP();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER trg_upd_users 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_upd_books 
    BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_upd_authors 
    BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_upd_loans 
    BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_upd_cards 
    BEFORE UPDATE ON membership_cards
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Function to maintain full-text search vector on books
CREATE OR REPLACE FUNCTION books_search_vector_tgr()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector('simple', coalesce(NEW.title, '')) ||
        to_tsvector('simple', coalesce(NEW.description, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply search vector trigger to books
CREATE TRIGGER trg_books_search_vector
    BEFORE INSERT OR UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION books_search_vector_tgr();

-- ========== ROW-LEVEL SECURITY ==========

-- Note: RLS setup requires app_role variable which should be set during execution
-- See migration 005_create_rls.sql for complete RLS implementation

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_cards ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
-- Users can select their own data or if they're admin
-- Users can update their own data or if they're admin
-- Only admins can insert/delete users

-- Books RLS Policies
-- Anyone can select books
-- Only admins can insert/update/delete books

-- Loans RLS Policies
-- Users can see their own loans or admins can see all
-- Users can insert/update their own loans
-- Only admins can delete loans

-- Membership Cards RLS Policies
-- Anyone can select membership cards
-- Only admins can insert/update/delete membership cards

-- ========== BUSINESS FUNCTIONS ==========

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

-- ========== END OF SCHEMA ==========

