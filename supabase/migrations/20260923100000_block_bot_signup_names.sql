-- ==========================================
-- ANTI-BOT À L'INSCRIPTION
-- Les bots s'inscrivent avec un nom aléatoire d'un seul bloc (ex. "kvWYSaTtXzlkzwIV").
-- On refuse toute création de compte dont le premier mot du nom (raw_user_meta_data->>'name')
-- dépasse 15 caractères. Le contrôle est fait en base (BEFORE INSERT sur auth.users) pour
-- qu'il s'applique même aux appels directs à l'API Auth, qui contournent le formulaire.
-- L'exception annule l'insertion : supabase.auth.signUp renvoie alors une erreur
-- ("Database error saving new user").
-- ==========================================
CREATE OR REPLACE FUNCTION public.block_bot_signup()
RETURNS trigger AS $$
DECLARE
    first_word TEXT;
BEGIN
    first_word := split_part(regexp_replace(btrim(coalesce(new.raw_user_meta_data->>'name', '')), '\s+', ' ', 'g'), ' ', 1);

    IF char_length(first_word) > 15 THEN
        RAISE EXCEPTION 'Invalid name' USING ERRCODE = 'check_violation';
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_block_bot_signup
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.block_bot_signup();
