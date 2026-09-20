-- ==========================================
-- OFFRE "ACCES A VIE" + OFFRE PREFERENTIELLE MAINFRAME/FEEDBACK
-- Suite de add_lifetime_statuses.sql (qui crée les valeurs d'enum utilisées ici).
-- ==========================================

-- Date de fin de l'accès mainframe + feedback inclus dans l'offre à vie (achat + N mois).
-- NULL pour tout autre statut. Le cron expire-trials bascule LIFETIME -> LIFETIME_EXPIRED une
-- fois cette date passée ; has_active_access() teste déjà la date elle-même, donc l'accès est
-- coupé à l'heure exacte même si le cron n'est pas encore passé.
ALTER TABLE users ADD COLUMN mainframe_ends_at TIMESTAMPTZ;

-- ==========================================
-- OFFER_SETTINGS : de singleton (id = 1) à une ligne par type d'offre
--   SUBSCRIPTION   : abonnement mensuel existant (ligne id 1, inchangée)
--   LIFETIME       : prix fixe, paiement unique. mainframe_months = durée mainframe/feedback incluse
--   LIFETIME_ADDON : abonnement mensuel mainframe + feedback à tarif préférentiel (lifetime uniquement)
-- Les nouvelles offres sont créées SANS stripe_price_id : tant que l'admin n'en a pas renseigné
-- un (/dashboard/admin/offer), l'offre n'est pas proposée aux étudiants.
-- ==========================================
ALTER TABLE offer_settings DROP CONSTRAINT IF EXISTS offer_settings_id_check;

ALTER TABLE offer_settings
    ADD COLUMN kind TEXT NOT NULL DEFAULT 'SUBSCRIPTION'
        CHECK (kind IN ('SUBSCRIPTION', 'LIFETIME', 'LIFETIME_ADDON')),
    ADD COLUMN mainframe_months INTEGER
        CHECK (mainframe_months IS NULL OR mainframe_months > 0);

ALTER TABLE offer_settings ALTER COLUMN kind DROP DEFAULT;
ALTER TABLE offer_settings ADD CONSTRAINT offer_settings_kind_key UNIQUE (kind);
ALTER TABLE offer_settings ALTER COLUMN stripe_price_id DROP NOT NULL;

INSERT INTO offer_settings (id, kind, title, price_cents, features, mainframe_months, stripe_price_id) VALUES
(
    2,
    'LIFETIME',
    'Cobol Training Lifetime',
    0,
    ARRAY[
        'Lifetime access to all modules',
        'Quizzes, exercises, and a final project'
    ],
    3,
    NULL
),
(
    3,
    'LIFETIME_ADDON',
    'Mainframe + Feedback',
    0,
    ARRAY[
        'Mainframe Access',
        'Personalized feedback on exercises'
    ],
    NULL,
    NULL
);

-- ==========================================
-- ACCES MAINFRAME (TSO)
-- Autorisé : abonnement actif, essai en cours, offre préférentielle en cours, ou offre à vie
-- tant que la fenêtre mainframe incluse n'est pas écoulée.
-- ==========================================
CREATE OR REPLACE FUNCTION public.has_active_access()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND (
          subscription_status IN ('ACTIVE', 'LIFETIME_ADDON')
          OR (subscription_status = 'TRIAL' AND trial_ends_at > now())
          OR (subscription_status = 'LIFETIME' AND mainframe_ends_at > now())
      )
);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- start_trial() bascule vers TRIAL n'importe quel statut dont trial_ends_at est NULL (cf.
-- add_invite_pending_status.sql). Un acheteur de l'offre à vie qui n'aurait jamais ouvert le
-- dashboard avant de payer verrait donc son statut écrasé au chargement suivant : on exclut ces
-- statuts. Reste identique pour tous les autres.
-- ==========================================
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS users AS $$
DECLARE v_user users;
BEGIN
    UPDATE users SET subscription_status = 'TRIAL', trial_ends_at = now() + interval '7 days'
    WHERE id = auth.uid()
      AND trial_ends_at IS NULL
      AND (subscription_status IS NULL OR subscription_status NOT IN ('LIFETIME', 'LIFETIME_EXPIRED', 'LIFETIME_ADDON'))
    RETURNING * INTO v_user;

    IF v_user.id IS NULL THEN
        SELECT * INTO v_user FROM users WHERE id = auth.uid();
    END IF;

    RETURN v_user;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- FEEDBACK / CORRECTION D'EXERCICES
-- Jusqu'ici l'envoi d'un exercice n'était limité que par l'accès au cours. On ne retire le droit
-- de demander une correction qu'aux utilisateurs de l'offre à vie dont la fenêtre est terminée :
-- le comportement des autres statuts (essai, abonnés, cours gratuits) est volontairement inchangé.
-- L'envoi se fait directement depuis le navigateur (RLS) : un trigger est donc la seule garde
-- réelle, l'interface ne fait qu'expliquer pourquoi le bouton est absent.
-- ==========================================
CREATE OR REPLACE FUNCTION public.feedback_access_revoked()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND (
          subscription_status = 'LIFETIME_EXPIRED'
          OR (subscription_status = 'LIFETIME' AND mainframe_ends_at <= now())
      )
);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.enforce_feedback_access()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.exercise_status = 'PENDING_REVIEW'
       AND (
           TG_OP = 'INSERT'
           OR NEW.exercise_status IS DISTINCT FROM OLD.exercise_status
           OR NEW.exercise_answer IS DISTINCT FROM OLD.exercise_answer
       )
       AND public.feedback_access_revoked() THEN
        RAISE EXCEPTION 'no_feedback_access';
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_feedback_access
    BEFORE INSERT OR UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE PROCEDURE public.enforce_feedback_access();
