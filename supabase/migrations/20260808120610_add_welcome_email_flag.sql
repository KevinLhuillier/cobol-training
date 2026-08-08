-- Ajout de la colonne welcome_email_sent à la table users
ALTER TABLE users
    ADD COLUMN welcome_email_sent BOOLEAN DEFAULT false NOT NULL;