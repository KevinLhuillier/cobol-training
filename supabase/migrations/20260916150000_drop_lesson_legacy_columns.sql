-- ==========================================
-- SUPPRESSION DES COLONNES LEGACY DE lessons (vimeo_url, content)
-- Remplacées par content_blocks (cf. 20260916130000_add_lesson_content_blocks.sql) :
-- toutes les leçons existantes ont été migrées (URL Vimeo -> bloc "video") via seed.sql
-- avant cette migration, donc plus aucune donnée n'est perdue.
-- ==========================================
ALTER TABLE lessons DROP COLUMN vimeo_url;
ALTER TABLE lessons DROP COLUMN content;
