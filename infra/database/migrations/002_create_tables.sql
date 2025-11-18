-- ===============================================
-- 002_create_tables.sql
-- Create all database tables
-- ===============================================

-- Users table
CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    email       VARCHAR(255)    UNIQUE NOT NULL,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    role        user_role       NOT NULL DEFAULT 'USER',
    password    VARCHAR(255)    NOT NULL,
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

-- Log table creation
DO $$
BEGIN
    RAISE NOTICE '✓ All tables created successfully';
END $$;

