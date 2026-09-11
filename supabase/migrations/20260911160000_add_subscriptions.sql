-- ==========================================
-- ABONNEMENTS & ESSAI GRATUIT
-- ==========================================
CREATE TYPE subscription_status AS ENUM ('TRIAL','ACTIVE','EXPIRED','CANCELED');

ALTER TABLE users
    ADD COLUMN subscription_status subscription_status,
    ADD COLUMN trial_ends_at TIMESTAMPTZ,
    ADD COLUMN stripe_customer_id TEXT UNIQUE,
    ADD COLUMN stripe_subscription_id TEXT;

ALTER TABLE courses ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX tso_users_available_idx ON tso_users (status) WHERE status = 'AVAILABLE';
CREATE INDEX users_subscription_idx ON users (subscription_status, trial_ends_at);

-- ==========================================
-- FONCTIONS SECURITY DEFINER (self-service, contournent RLS de façon contrôlée)
-- ==========================================

-- Helper interne : ne révèle que le statut de l'appelant lui-même (déjà lisible via SELECT direct).
CREATE OR REPLACE FUNCTION public.has_active_access()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND (subscription_status = 'ACTIVE' OR (subscription_status = 'TRIAL' AND trial_ends_at > now()))
);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Démarre l'essai de 7 jours une seule fois (idempotent), à la première connexion.
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS users AS $$
DECLARE v_user users;
BEGIN
    UPDATE users SET subscription_status = 'TRIAL', trial_ends_at = now() + interval '7 days'
    WHERE id = auth.uid() AND trial_ends_at IS NULL
    RETURNING * INTO v_user;

    IF v_user.id IS NULL THEN
        SELECT * INTO v_user FROM users WHERE id = auth.uid();
    END IF;

    RETURN v_user;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;

-- Assigne atomiquement un compte TSO disponible à l'appelant.
CREATE OR REPLACE FUNCTION public.claim_tso_account()
RETURNS tso_users AS $$
DECLARE v_account tso_users;
BEGIN
    IF EXISTS (SELECT 1 FROM tso_users WHERE assigned_to_user_id = auth.uid() AND status = 'ASSIGNED') THEN
        RAISE EXCEPTION 'already_assigned';
    END IF;

    IF NOT public.has_active_access() THEN
        RAISE EXCEPTION 'no_active_access';
    END IF;

    UPDATE tso_users SET status = 'ASSIGNED', assigned_to_user_id = auth.uid()
    WHERE id = (SELECT id FROM tso_users WHERE status = 'AVAILABLE' ORDER BY random() LIMIT 1 FOR UPDATE SKIP LOCKED)
    RETURNING * INTO v_account;

    IF v_account.id IS NULL THEN
        RAISE EXCEPTION 'no_account_available';
    END IF;

    RETURN v_account;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION public.claim_tso_account() TO authenticated;

-- Persiste l'id client Stripe de l'appelant (première fois seulement).
CREATE OR REPLACE FUNCTION public.set_stripe_customer_id(p_customer_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE users SET stripe_customer_id = p_customer_id
    WHERE id = auth.uid() AND stripe_customer_id IS NULL;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION public.set_stripe_customer_id(TEXT) TO authenticated;
