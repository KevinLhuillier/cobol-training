-- ==========================================
-- CHECK-IN J+3 : email personnel envoyé 3 jours après le démarrage de l'essai
-- trial_checkin_sent_at évite un second envoi si un run ultérieur retombe dans la fenêtre
-- (même logique que trial_reminder_sent_at, cf. add_trial_reminder_sent.sql).
-- ==========================================
ALTER TABLE users
    ADD COLUMN trial_checkin_sent_at TIMESTAMPTZ;
