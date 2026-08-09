-- ==========================================
-- 1. ACTIVER LE RLS SUR TOUTES LES TABLES
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tso_users ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. FONCTION SÉCURISÉE (ADMIN CHECK)
-- ==========================================
-- Permet de vérifier si le membre est admin sans créer de boucle infinie.
-- SECURITY DEFINER permet à la fonction de lire la table users même si le RLS bloque.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'::user_role
);
$$ LANGUAGE sql SECURITY DEFINER;

-- ==========================================
-- 3. POLITIQUES : USERS
-- ==========================================
-- Les utilisateurs peuvent voir uniquement leur propre profil
CREATE POLICY "Les utilisateurs voient leur profil" ON users FOR SELECT USING (auth.uid() = id);
-- Les administrateurs peuvent tout faire
CREATE POLICY "Admins full access users" ON users FOR ALL USING (public.is_admin());
-- (L'insertion à l'inscription passe par notre Trigger qui contourne le RLS, donc c'est sécurisé).

-- ==========================================
-- 4. POLITIQUES : CATALOGUE (Lecture publique)
-- ==========================================
CREATE POLICY "Catalogue en lecture libre" ON courses FOR SELECT USING (true);
CREATE POLICY "Admins full access courses" ON courses FOR ALL USING (public.is_admin());

CREATE POLICY "Chapitres en lecture libre" ON chapters FOR SELECT USING (true);
CREATE POLICY "Admins full access chapters" ON chapters FOR ALL USING (public.is_admin());

CREATE POLICY "Leçons en lecture libre" ON lessons FOR SELECT USING (true);
CREATE POLICY "Admins full access lessons" ON lessons FOR ALL USING (public.is_admin());

-- ==========================================
-- 5. POLITIQUES : DONNÉES ÉTUDIANTS (Privé)
-- ==========================================
CREATE POLICY "Etudiants gèrent leur progression" ON lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins full access progression" ON lesson_progress FOR ALL USING (public.is_admin());


-- ==========================================
-- 6. POLITIQUES : ACCÈS TSO
-- ==========================================
CREATE POLICY "Etudiants voient leur compte TSO" ON tso_users FOR SELECT USING (auth.uid() = assigned_to_user_id);
CREATE POLICY "Admins full access TSO" ON tso_users FOR ALL USING (public.is_admin());