-- Création des types ENUM
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID');
CREATE TYPE submission_status AS ENUM ('PENDING', 'CORRECTED');
CREATE TYPE lesson_type AS ENUM ('VIDEO', 'EXERCISE', 'QUIZ');
CREATE TYPE exercise_status AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE tso_status AS ENUM ('AVAILABLE', 'ASSIGNED', 'BLOCKED', 'RESET_REQUIRED');

-- Fonction pour mettre à jour automatiquement "updated_at"
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- UTILISATEURS & ABONNEMENTS (STRIPE)
-- ==========================================
CREATE TABLE users (
    -- L'ID est la clé étrangère vers le système d'authentification de Supabase
                       id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                       email TEXT UNIQUE NOT NULL,
                       name TEXT,
                       role user_role DEFAULT 'USER'::user_role,

                       stripe_customer_id TEXT UNIQUE,
                       stripe_subscription_id TEXT UNIQUE,
                       stripe_price_id TEXT,
                       subscription_status subscription_status,
                       subscription_period_end TIMESTAMPTZ,

                       created_at TIMESTAMPTZ DEFAULT now(),
                       updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- CATALOGUE DE COURS
-- ==========================================
CREATE TABLE courses (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         title TEXT NOT NULL,
                         description TEXT,
                         image_url TEXT,
                         is_published BOOLEAN DEFAULT false,

                         created_at TIMESTAMPTZ DEFAULT now(),
                         updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE chapters (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          title TEXT NOT NULL,
                          position INTEGER NOT NULL,
                          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

                          created_at TIMESTAMPTZ DEFAULT now(),
                          updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE lessons (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         title TEXT NOT NULL,
                         vimeo_url TEXT,
                         content TEXT, -- LongText devient simplement TEXT sur Postgres
                         position INTEGER NOT NULL,
                         is_free_preview BOOLEAN DEFAULT false,
                         type lesson_type DEFAULT 'VIDEO'::lesson_type,
                         chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,

                         created_at TIMESTAMPTZ DEFAULT now(),
                         updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- PROGRESSION & EXERCICES
-- ==========================================
CREATE TABLE lesson_progress (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 is_completed BOOLEAN DEFAULT true,
                                 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                 lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

                                 exercise_answer TEXT,
                                 exercise_status exercise_status,
                                 review_feedback TEXT,

                                 created_at TIMESTAMPTZ DEFAULT now(),
                                 updated_at TIMESTAMPTZ DEFAULT now(),

                                 UNIQUE(user_id, lesson_id)
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE exercises (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           title TEXT NOT NULL,
                           statement TEXT NOT NULL,
                           lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

                           created_at TIMESTAMPTZ DEFAULT now(),
                           updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE exercise_submissions (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      content TEXT NOT NULL,
                                      feedback TEXT,
                                      status submission_status DEFAULT 'PENDING'::submission_status,

                                      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                      exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

                                      submitted_at TIMESTAMPTZ DEFAULT now(),
                                      corrected_at TIMESTAMPTZ
);

-- ==========================================
-- TSO USERS
-- ==========================================
CREATE TABLE tso_users (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           username TEXT UNIQUE NOT NULL,
                           password TEXT NOT NULL, -- Stocké en clair comme demandé
                           status tso_status DEFAULT 'AVAILABLE'::tso_status,

                           assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

                           created_at TIMESTAMPTZ DEFAULT now(),
                           updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tso_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
INSERT INTO public.users (id, email, name, role)
VALUES (
           new.id,
           new.email,
           -- Récupère le nom depuis les metadata d'inscription si tu l'envoies
           new.raw_user_meta_data->>'name',
           'USER'
       );
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur lié au système d'Auth
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();