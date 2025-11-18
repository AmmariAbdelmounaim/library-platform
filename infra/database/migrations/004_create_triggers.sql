-- ===============================================
-- 004_create_triggers.sql
-- Create triggers for automatic updates
-- ===============================================

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

-- Log trigger creation
DO $$
BEGIN
    RAISE NOTICE '✓ All triggers created successfully';
END $$;

