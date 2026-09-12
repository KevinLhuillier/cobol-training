-- ==========================================
-- GRANTS DE BASE (nécessaires en plus du RLS)
-- Les policies RLS filtrent les lignes mais ne donnent aucun droit
-- d'accès à la table elle-même. Sans ces GRANT, toute requête échoue
-- avec "permission denied" (42501), RLS ou pas.
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Catalogue : lecture publique (anon + authenticated), écriture réservée aux admins via RLS
GRANT SELECT ON courses, chapters, lessons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON courses, chapters, lessons TO authenticated;

-- Données utilisateur : accès restreint par RLS (propre profil ou admin)
GRANT SELECT, INSERT, UPDATE, DELETE ON users, lesson_progress, tso_users TO authenticated;
