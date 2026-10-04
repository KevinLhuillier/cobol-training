-- ==========================================
-- SUPPRESSION DES CHALLENGES
-- La fonctionnalité Challenges est remplacée par les Projets (cf. add_projects_feature.sql) :
-- tables, policies, trigger et index associés sont supprimés (CASCADE pour les policies de
-- challenge_submissions qui référencent challenges).
-- ==========================================
DROP TABLE IF EXISTS challenge_submissions CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
