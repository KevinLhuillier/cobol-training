-- ==========================================
-- CONNEXION MAINFRAME : HOST & PORT
-- ==========================================
ALTER TABLE tso_users ADD COLUMN host TEXT;
ALTER TABLE tso_users ADD COLUMN port INTEGER;
