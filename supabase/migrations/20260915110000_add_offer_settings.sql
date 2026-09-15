-- ==========================================
-- PARAMETRES DE L'OFFRE D'ABONNEMENT
-- Ligne unique (singleton, id figé à 1) éditable depuis /dashboard/admin/offer, affichée sur
-- /dashboard/subscribe. Le prix est purement informatif : il n'est PAS branché sur Stripe,
-- l'admin doit répercuter tout changement de prix dans le Dashboard Stripe à la main.
-- ==========================================
CREATE TABLE offer_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    title TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON offer_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

INSERT INTO offer_settings (id, title, price_cents, features) VALUES (
    1,
    'Cobol Training subscription',
    1500,
    ARRAY[
        'Access to all modules',
        'Mainframe Access',
        'Personalized feedback on exercises',
        'Private channel to chat with the instructor'
    ]
);

ALTER TABLE offer_settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique aux utilisateurs connectés (page /dashboard/subscribe), écriture admin uniquement.
CREATE POLICY "Lecture de l'offre" ON offer_settings FOR SELECT USING (true);
CREATE POLICY "Admins modifient l'offre" ON offer_settings FOR UPDATE
    USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON offer_settings TO anon, authenticated;
GRANT UPDATE ON offer_settings TO authenticated;
