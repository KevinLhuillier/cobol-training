-- ==========================================
-- MODE MAINTENANCE
-- Ligne unique (singleton, id figé à 1), lue par proxy.ts à chaque requête pour décider de
-- rediriger ou non vers /maintenance. Écriture réservée aux admins (bouton dans
-- /dashboard/admin), lecture publique nécessaire car proxy.ts doit pouvoir la lire même pour
-- un visiteur anonyme non connecté.
-- ==========================================
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

INSERT INTO app_settings (id, maintenance_mode) VALUES (1, false);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des réglages" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admins modifient les réglages" ON app_settings FOR UPDATE
    USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON app_settings TO anon, authenticated;
GRANT UPDATE ON app_settings TO authenticated;
