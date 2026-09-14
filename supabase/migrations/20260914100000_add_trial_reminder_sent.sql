-- ==========================================
-- RAPPEL D'ESSAI : email envoyé la veille de la fin du trial
-- trial_reminder_sent_at évite un double envoi si le cron tourne plusieurs
-- fois pendant la fenêtre "essai se termine demain" (contrairement à un
-- simple filtre sur trial_ends_at, qui matcherait à nouveau le lendemain).
-- ==========================================
ALTER TABLE users
    ADD COLUMN trial_reminder_sent_at TIMESTAMPTZ;
