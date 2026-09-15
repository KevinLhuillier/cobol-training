-- ==========================================
-- TRACABILITE DES CONNEXIONS
-- Une ligne par connexion réelle (IP + pays + horodatage), utilisée à la fois pour
-- l'audit et pour bloquer, à l'inscription, une IP ayant déjà servi à un compte
-- existant (anti multi-comptes / multi-essais gratuits).
-- Dédupliquée sur (user_id, signed_in_at) : signed_in_at = auth.users.last_sign_in_at
-- au moment de l'enregistrement, ce qui rend l'appel idempotent même si le composant
-- serveur qui l'appelle est rendu plusieurs fois pour la même session (cf. ensureTrialStarted).
-- ==========================================
CREATE TABLE login_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    country TEXT,
    signed_in_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, signed_in_at)
);

-- Utilisé au moment de l'inscription pour vérifier si l'IP a déjà servi à un compte.
CREATE INDEX login_events_ip_address_idx ON login_events (ip_address);

ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;

-- Un utilisateur ne peut enregistrer qu'une connexion pour lui-même.
CREATE POLICY "Enregistrer sa propre connexion" ON login_events FOR INSERT
    WITH CHECK (user_id = auth.uid());
-- Lecture réservée aux admins (données de traçabilité, pas un historique perso à exposer).
CREATE POLICY "Admins lisent les connexions" ON login_events FOR SELECT
    USING (public.is_admin());

-- GRANT explicite obligatoire en plus du RLS (cf. add_table_grants.sql).
GRANT SELECT, INSERT ON login_events TO authenticated;
