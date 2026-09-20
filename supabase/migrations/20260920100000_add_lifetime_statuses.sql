-- ==========================================
-- STATUTS DE L'OFFRE "ACCES A VIE"
-- LIFETIME         : a acheté l'offre à prix fixe. Modules à vie + accès mainframe (TSO) et
--                    correction/feedback pendant N mois (users.mainframe_ends_at).
-- LIFETIME_EXPIRED : les N mois sont écoulés. Modules à vie conservés, plus de TSO ni de feedback.
--                    C'est le seul statut à qui l'offre préférentielle (LIFETIME_ADDON) est proposée.
-- LIFETIME_ADDON   : abonnement mensuel "mainframe + feedback" à tarif préférentiel en cours.
--                    À sa fin (annulation/impayé), retour à LIFETIME_EXPIRED.
-- Les nouvelles valeurs d'enum ne sont pas utilisables dans la transaction qui les crée :
-- les fonctions/tables qui s'en servent sont dans la migration suivante (add_lifetime_offer).
-- ==========================================
ALTER TYPE subscription_status ADD VALUE 'LIFETIME';
ALTER TYPE subscription_status ADD VALUE 'LIFETIME_EXPIRED';
ALTER TYPE subscription_status ADD VALUE 'LIFETIME_ADDON';
