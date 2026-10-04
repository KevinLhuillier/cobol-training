-- ==========================================
-- CHAPITRES ET LEÇONS GRATUITS
-- Permet aux non-abonnés de commencer un cours payant : une leçon est accessible sans abonnement
-- si son chapitre ET elle-même sont gratuits (même logique que courses.is_free, au niveau du
-- contenu). Un cours gratuit reste entièrement accessible, quels que soient ces indicateurs.
-- ==========================================

-- Tout le contenu, existant comme futur, est réservé aux abonnés par défaut : l'admin marque
-- ensuite comme gratuits les chapitres et leçons à ouvrir.
ALTER TABLE chapters ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE lessons ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;
