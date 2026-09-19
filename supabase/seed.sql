-- ==========================================
-- SEED : COMPTES TSO
-- ==========================================
-- Insère le pool de comptes TSO (mainframe.example) avec le même host/port.
-- ON CONFLICT (username) DO NOTHING permet de relancer le seed sans dupliquer
-- ni écraser des comptes déjà assignés à des étudiants.

INSERT INTO tso_users (username, password, status, host, port)
VALUES
    ('USER21', 'LONDON06', 'AVAILABLE', '15.235.81.45', 23),
    ('USER22', 'BERLIN54', 'AVAILABLE', '15.235.81.45', 23),
    ('USER23', 'DUBLIN78', 'AVAILABLE', '15.235.81.45', 23),
    ('USER24', 'LISBON96', 'AVAILABLE', '15.235.81.45', 23),
    ('USER25', 'ATHENS88', 'AVAILABLE', '15.235.81.45', 23),
    ('USER26', 'MOSCOU41', 'AVAILABLE', '15.235.81.45', 23),
    ('USER27', 'OTTAWA23', 'AVAILABLE', '15.235.81.45', 23),
    ('USER28', 'BOGOTA17', 'AVAILABLE', '15.235.81.45', 23),
    ('USER29', 'MANILA54', 'AVAILABLE', '15.235.81.45', 23),
    ('USER30', 'MUMBAI84', 'AVAILABLE', '15.235.81.45', 23),
    ('USER31', 'TAIPEI96', 'AVAILABLE', '15.235.81.45', 23),
    ('USER32', 'YANGON61', 'AVAILABLE', '15.235.81.45', 23),
    ('USER33', 'BAGDAD23', 'AVAILABLE', '15.235.81.45', 23),
    ('USER34', 'TEHRAN47', 'AVAILABLE', '15.235.81.45', 23),
    ('USER35', 'RIYADH52', 'AVAILABLE', '15.235.81.45', 23),
    ('USER36', 'ZURICH47', 'AVAILABLE', '15.235.81.45', 23),
    ('USER37', 'VIENNA63', 'AVAILABLE', '15.235.81.45', 23),
    ('USER38', 'WARSAW67', 'AVAILABLE', '15.235.81.45', 23),
    ('USER39', 'MUNICH24', 'AVAILABLE', '15.235.81.45', 23),
    ('USER40', 'NAPLES57', 'AVAILABLE', '15.235.81.45', 23),
    ('USER41', 'DENVER67', 'AVAILABLE', '15.235.81.45', 23),
    ('USER42', 'BOSTON52', 'AVAILABLE', '15.235.81.45', 23),
    ('USER43', 'DALLAS16', 'AVAILABLE', '15.235.81.45', 23),
    ('USER44', 'AUSTIN04', 'AVAILABLE', '15.235.81.45', 23),
    ('USER45', 'BEIRUT64', 'AVAILABLE', '15.235.81.45', 23),
    ('USER46', 'KUWAIT35', 'AVAILABLE', '15.235.81.45', 23),
    ('USER47', 'ANKARA38', 'AVAILABLE', '15.235.81.45', 23),
    ('USER48', 'MOSCOW37', 'AVAILABLE', '15.235.81.45', 23),
    ('USER49', 'BRAZIL12', 'AVAILABLE', '15.235.81.45', 23),
    ('USER50', 'CANADA11', 'AVAILABLE', '15.235.81.45', 23),
    ('USER51', 'MEXICO10', 'AVAILABLE', '15.235.81.45', 23),
    ('USER52', 'FRANCE16', 'AVAILABLE', '15.235.81.45', 23),
    ('USER53', 'NORWAY19', 'AVAILABLE', '15.235.81.45', 23),
    ('USER54', 'POLAND29', 'AVAILABLE', '15.235.81.45', 23),
    ('USER55', 'SWEDEN39', 'AVAILABLE', '15.235.81.45', 23),
    ('USER56', 'TURKEY49', 'AVAILABLE', '15.235.81.45', 23),
    ('USER57', 'GREECE59', 'AVAILABLE', '15.235.81.45', 23),
    ('USER58', 'ISRAEL84', 'AVAILABLE', '15.235.81.45', 23),
    ('USER59', 'UGANDA82', 'AVAILABLE', '15.235.81.45', 23),
    ('USER60', 'ZAMBIA81', 'AVAILABLE', '15.235.81.45', 23),
    ('USER61', 'ANGOLA88', 'AVAILABLE', '15.235.81.45', 23),
    ('USER62', 'JORDAN41', 'AVAILABLE', '15.235.81.45', 23),
    ('USER63', 'GENEVA08', 'AVAILABLE', '15.235.81.45', 23),
    ('USER64', 'MALAWI41', 'AVAILABLE', '15.235.81.45', 23),
    ('USER65', 'GUYANA07', 'AVAILABLE', '15.235.81.45', 23),
    ('USER66', 'PANAMA06', 'AVAILABLE', '15.235.81.45', 23),
    ('USER67', 'HAVANA43', 'AVAILABLE', '15.235.81.45', 23),
    ('USER68', 'LAHORE03', 'AVAILABLE', '15.235.81.45', 23),
    ('USER69', 'ALBANY02', 'AVAILABLE', '15.235.81.45', 23),
    ('USER70', 'DADBAG51', 'AVAILABLE', '15.235.81.45', 23)
ON CONFLICT (username) DO NOTHING;

-- ==========================================
-- SEED : CATALOGUE DE COURS COMPLET (10 modules)
-- Idempotent via SELECT ... WHERE NOT EXISTS (pas de contrainte UNIQUE sur title,
-- donc pas d'ON CONFLICT possible) : rejouer ce seed ne duplique rien.
-- Cours non-gratuits (is_free = false, valeur par défaut), chapitres et leçons publiés directement (is_published = true, le défaut de ces colonnes étant false) ;
-- toutes les leçons sont de type VIDEO, l'URL Vimeo étant stockée comme unique bloc
-- "video" dans content_blocks (format lu par le LessonBuilder). Positions 1-based
-- (cours, chapitres, leçons).
-- Un bloc DO par module : la boucle sur unnest(titres[], urls[]) WITH ORDINALITY
-- évite de répéter un IF NOT EXISTS par leçon (jusqu'à 25 par module).
-- ==========================================

-- ===== Module 1 - Onboarding =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 1 - Onboarding';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 1 - Onboarding', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Onboarding';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - Onboarding', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Introduction', 'Installing your environment'],
            ARRAY['https://vimeo.com/1118476860?share=copy', 'https://vimeo.com/1118476517?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 2 - TSO & ISPF =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 2 - TSO & ISPF';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 2 - TSO & ISPF', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - TSO & ISPF';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - TSO & ISPF', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Login to TSO', 'Logout from TSO', 'Navigation', 'Overview of ISPF Menus', 'File System', 'How to Edit a File?'],
            ARRAY['https://vimeo.com/1114768902?share=copy', 'https://vimeo.com/1114768910?share=copy', 'https://vimeo.com/1114768916?share=copy', 'https://vimeo.com/1114768924?share=copy', 'https://vimeo.com/1114768930?share=copy', 'https://vimeo.com/1114768945?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 2 - TSO & ISPF : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 2 - TSO & ISPF';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - TSO & ISPF';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m2-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "What does TSO stand for?",
                    "answers": [
                        {"id": "m2-q1-a1", "text": "Terminal System Operator", "isCorrect": false},
                        {"id": "m2-q1-a2", "text": "Time Sharing Option", "isCorrect": true, "explanation": "TSO (Time Sharing Option) is the IBM facility that allows users to interact with z/OS."},
                        {"id": "m2-q1-a3", "text": "Task Sequential Operation", "isCorrect": false},
                        {"id": "m2-q1-a4", "text": "Transaction Session Output", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "A PS (Physical Sequential) dataset is:",
                    "answers": [
                        {"id": "m2-q2-a1", "text": "A dataset containing a single stream of records", "isCorrect": true, "explanation": "PS datasets store records in a simple sequential order, like a flat file."},
                        {"id": "m2-q2-a2", "text": "A library containing multiple members", "isCorrect": false},
                        {"id": "m2-q2-a3", "text": "A dataset reserved for JCL", "isCorrect": false},
                        {"id": "m2-q2-a4", "text": "A binary-only dataset", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "Which statement is correct about a PDS (Partitioned Data Set)?",
                    "answers": [
                        {"id": "m2-q3-a1", "text": "It can only contain one member", "isCorrect": false},
                        {"id": "m2-q3-a2", "text": "It is reserved for executables only", "isCorrect": false},
                        {"id": "m2-q3-a3", "text": "It is a collection of sequential datasets called members", "isCorrect": true, "explanation": "A PDS works like a library, with each \"member\" acting like a separate file inside it."},
                        {"id": "m2-q3-a4", "text": "It cannot be edited in ISPF", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q4",
                    "type": "MULTIPLE_CHOICE",
                    "text": "In ISPF, which options let you edit a dataset?",
                    "answers": [
                        {"id": "m2-q4-a1", "text": "Option 2 (Edit)", "isCorrect": true, "explanation": "Option 2 opens the editor directly."},
                        {"id": "m2-q4-a2", "text": "Option 3.4 (Data Set List Utility)", "isCorrect": true, "explanation": "Option 3.4 lists datasets and lets you enter E to edit."},
                        {"id": "m2-q4-a3", "text": "Option 0 (Settings)", "isCorrect": false},
                        {"id": "m2-q4-a4", "text": "Option 1 (View)", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "The 3.4 option in the ISPF menu is used to:",
                    "answers": [
                        {"id": "m2-q5-a1", "text": "Submit a batch job", "isCorrect": false},
                        {"id": "m2-q5-a2", "text": "List and navigate datasets", "isCorrect": true, "explanation": "Option 3.4 is the Dataset List Utility, where you can search, browse, and edit datasets."},
                        {"id": "m2-q5-a3", "text": "Change user settings", "isCorrect": false},
                        {"id": "m2-q5-a4", "text": "Manage spool output", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "Inside a PDS, what are the individual elements called?",
                    "answers": [
                        {"id": "m2-q6-a1", "text": "Members", "isCorrect": true, "explanation": "A PDS is made up of \"members\", which are like individual files stored inside the dataset."},
                        {"id": "m2-q6-a2", "text": "Tracks", "isCorrect": false},
                        {"id": "m2-q6-a3", "text": "Volumes", "isCorrect": false},
                        {"id": "m2-q6-a4", "text": "Sequences", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "When editing a file, which line command inserts a blank line below the current line?",
                    "answers": [
                        {"id": "m2-q7-a1", "text": "B", "isCorrect": false},
                        {"id": "m2-q7-a2", "text": "I", "isCorrect": true, "explanation": "The I command inserts a blank line below."},
                        {"id": "m2-q7-a3", "text": "D", "isCorrect": false},
                        {"id": "m2-q7-a4", "text": "A", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "What does the RR line command do?",
                    "answers": [
                        {"id": "m2-q8-a1", "text": "Replaces a word", "isCorrect": false},
                        {"id": "m2-q8-a2", "text": "Rolls lines up", "isCorrect": false},
                        {"id": "m2-q8-a3", "text": "Removes trailing spaces", "isCorrect": false},
                        {"id": "m2-q8-a4", "text": "Repeats a block of lines", "isCorrect": true, "explanation": "RR (paired) replicates the lines between the two RR commands."}
                    ]
                },
                {
                    "id": "m2-q9",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the effect of the D command entered as D2?",
                    "answers": [
                        {"id": "m2-q9-a1", "text": "Deletes 2 lines", "isCorrect": true},
                        {"id": "m2-q9-a2", "text": "Duplicates 2 lines", "isCorrect": false},
                        {"id": "m2-q9-a3", "text": "Copies 2 lines", "isCorrect": false},
                        {"id": "m2-q9-a4", "text": "Inserts 2 members", "isCorrect": false}
                    ]
                },
                {
                    "id": "m2-q10",
                    "type": "SINGLE_CHOICE",
                    "text": "Which line command duplicates a line directly below it?",
                    "answers": [
                        {"id": "m2-q10-a1", "text": "R", "isCorrect": true},
                        {"id": "m2-q10-a2", "text": "C", "isCorrect": false},
                        {"id": "m2-q10-a3", "text": "M", "isCorrect": false},
                        {"id": "m2-q10-a4", "text": "D", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 3 - Hello World - Your First Cobol Program =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 3 - Hello World - Your First Cobol Program';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 3 - Hello World - Your First Cobol Program', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Hello World';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - Hello World', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Coding the program', 'Compilation', 'Running the program', 'Program''s Report in SDSF'],
            ARRAY['https://vimeo.com/1114768973?share=copy', 'https://vimeo.com/1114768985?share=copy', 'https://vimeo.com/1114768953?share=copy', 'https://vimeo.com/1114768961?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 3 - Hello World : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 3 - Hello World - Your First Cobol Program';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Hello World';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m3-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "In a COBOL program that displays ''Hello World'', in which division should the DISPLAY statement be located?",
                    "answers": [
                        {"id": "m3-q1-a1", "text": "IDENTIFICATION DIVISION", "isCorrect": false},
                        {"id": "m3-q1-a2", "text": "ENVIRONMENT DIVISION", "isCorrect": false},
                        {"id": "m3-q1-a3", "text": "DATA DIVISION", "isCorrect": false},
                        {"id": "m3-q1-a4", "text": "PROCEDURE DIVISION", "isCorrect": true, "explanation": "The PROCEDURE DIVISION contains all the logic and executable instructions."}
                    ]
                },
                {
                    "id": "m3-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the primary role of the compilation stage for a program?",
                    "answers": [
                        {"id": "m3-q2-a1", "text": "Execute the program to see the result.", "isCorrect": false},
                        {"id": "m3-q2-a2", "text": "Translate the source code into binary code.", "isCorrect": true, "explanation": "The compiler checks the syntax and converts the code into machine language."},
                        {"id": "m3-q2-a3", "text": "Display the job report in SDSF.", "isCorrect": false},
                        {"id": "m3-q2-a4", "text": "Save the source code in a PDS.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m3-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "In which area (columns) are the instructions written?",
                    "answers": [
                        {"id": "m3-q3-a1", "text": "Margin A (columns 8 to 11)", "isCorrect": false},
                        {"id": "m3-q3-a2", "text": "Margin B (columns 12 to 72).", "isCorrect": true, "explanation": "It is the area dedicated to writing instructions."},
                        {"id": "m3-q3-a3", "text": "Sequence area (columns 1 to 6).", "isCorrect": false},
                        {"id": "m3-q3-a4", "text": "Indicator area (column 7).", "isCorrect": false}
                    ]
                },
                {
                    "id": "m3-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "Which return code (MAXCC) generally indicates that the compilation was successful without any errors or warnings?",
                    "answers": [
                        {"id": "m3-q4-a1", "text": "0000", "isCorrect": true},
                        {"id": "m3-q4-a2", "text": "0004", "isCorrect": false},
                        {"id": "m3-q4-a3", "text": "0008", "isCorrect": false},
                        {"id": "m3-q4-a4", "text": "0012", "isCorrect": false}
                    ]
                },
                {
                    "id": "m3-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "Under which system file name can the output of the DISPLAY statement be found in SDSF?",
                    "answers": [
                        {"id": "m3-q5-a1", "text": "JESMSGLG", "isCorrect": false},
                        {"id": "m3-q5-a2", "text": "SYSPRINT", "isCorrect": false},
                        {"id": "m3-q5-a3", "text": "SYSOUT", "isCorrect": true, "explanation": "By convention, the DISPLAY is directed to the SYSOUT DDname."},
                        {"id": "m3-q5-a4", "text": "SYSIN", "isCorrect": false}
                    ]
                },
                {
                    "id": "m3-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "To cleanly terminate a program and return control to the system, which instruction is used?",
                    "answers": [
                        {"id": "m3-q6-a1", "text": "END PROGRAM", "isCorrect": false},
                        {"id": "m3-q6-a2", "text": "EXIT", "isCorrect": false},
                        {"id": "m3-q6-a3", "text": "STOP RUN", "isCorrect": true},
                        {"id": "m3-q6-a4", "text": "FINISH", "isCorrect": false}
                    ]
                },
                {
                    "id": "m3-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "Which division is mandatory and must be the very first one in a COBOL program?",
                    "answers": [
                        {"id": "m3-q7-a1", "text": "PROCEDURE DIVISION", "isCorrect": false},
                        {"id": "m3-q7-a2", "text": "DATA DIVISION", "isCorrect": false},
                        {"id": "m3-q7-a3", "text": "IDENTIFICATION DIVISION", "isCorrect": true},
                        {"id": "m3-q7-a4", "text": "ENVIRONMENT DIVISION", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 4 - Cobol Basics =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 4 - Cobol Basics';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 4 - Cobol Basics', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Cobol Basics';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - Cobol Basics', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Structure of a line of code', 'Program Structure', 'Identification Division', 'Adding Comments', 'Debugging the Compilation', 'How to Declare Variables?', 'Groups of Variables', 'DISPLAY Instruction', 'MOVE Instruction', 'How to Purge Jobs in SDSF', 'ACCEPT Instruction', 'FILLER', 'How to Initialize Variables?', 'ADD Instruction', 'SUBTRACT Instruction', 'MULTIPLY Instruction', 'DIVIDE Instruction', 'COMPUTE Instruction', 'IF Statement', 'EVALUATE Statement', 'Loops', 'The Period', 'Paragraphs', 'Sections', 'Condition Names'],
            ARRAY['https://vimeo.com/1114769004?share=copy', 'https://vimeo.com/1114769012?share=copy', 'https://vimeo.com/1114769017?share=copy', 'https://vimeo.com/1114769026?share=copy', 'https://vimeo.com/1114769032?share=copy', 'https://vimeo.com/1114769040?share=copy', 'https://vimeo.com/1114769045?share=copy', 'https://vimeo.com/1114769055?share=copy', 'https://vimeo.com/1114769061?share=copy', 'https://vimeo.com/1114769077?share=copy', 'https://vimeo.com/1114769081?share=copy', 'https://vimeo.com/1114769087?share=copy', 'https://vimeo.com/1114769098?share=copy', 'https://vimeo.com/1114769107?share=copy', 'https://vimeo.com/1114769115?share=copy', 'https://vimeo.com/1114769124?share=copy', 'https://vimeo.com/1114769133?share=copy', 'https://vimeo.com/1114769142?share=copy', 'https://vimeo.com/1114769149?share=copy', 'https://vimeo.com/1114769171?share=copy', 'https://vimeo.com/1114769186?share=copy', 'https://vimeo.com/1114769196?share=copy', 'https://vimeo.com/1114769208?share=copy', 'https://vimeo.com/1114769217?share=copy', 'https://vimeo.com/1114769226?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 4 - Cobol Basics : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 4 - Cobol Basics';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Cobol Basics';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m4-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "In the structure of a COBOL code line, what is the specific function of column 7?",
                    "answers": [
                        {"id": "m4-q1-a1", "text": "It is used to indicate a comment (with an asterisk *).", "isCorrect": true, "explanation": "Column 7 is the indicator area used to define comment lines or line continuations."},
                        {"id": "m4-q1-a2", "text": "It is used to number the lines of the program.", "isCorrect": false},
                        {"id": "m4-q1-a3", "text": "It must always remain empty for compilation reasons.", "isCorrect": false},
                        {"id": "m4-q1-a4", "text": "It marks the beginning of Area A.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "Which division contains the links to external files?",
                    "answers": [
                        {"id": "m4-q2-a1", "text": "PROCEDURE DIVISION", "isCorrect": false},
                        {"id": "m4-q2-a2", "text": "DATA DIVISION", "isCorrect": false},
                        {"id": "m4-q2-a3", "text": "ENVIRONMENT DIVISION", "isCorrect": true, "explanation": "It serves as a bridge between the program and the computer/files via the CONFIGURATION and INPUT-OUTPUT sections."},
                        {"id": "m4-q2-a4", "text": "IDENTIFICATION DIVISION", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "How would you define a variable named ''WS-PRICE'' capable of storing exactly 5 digits without decimals?",
                    "answers": [
                        {"id": "m4-q3-a1", "text": "01 WS-PRICE PICTURE IS 999.", "isCorrect": false},
                        {"id": "m4-q3-a2", "text": "01 WS-PRICE PIC 9V9999.", "isCorrect": false},
                        {"id": "m4-q3-a3", "text": "01 WS-PRICE PIC X(5).", "isCorrect": false},
                        {"id": "m4-q3-a4", "text": "01 WS-PRICE PIC 9(5).", "isCorrect": true, "explanation": "The symbol 9 indicates a numeric value and (5) indicates the length."}
                    ]
                },
                {
                    "id": "m4-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the purpose of the FILLER keyword in the DATA DIVISION?",
                    "answers": [
                        {"id": "m4-q4-a1", "text": "To force the variable to be of a numeric type.", "isCorrect": false},
                        {"id": "m4-q4-a2", "text": "To automatically fill a variable with zeros.", "isCorrect": false},
                        {"id": "m4-q4-a3", "text": "To give a generic name to a field that will not be used directly by its name.", "isCorrect": true, "explanation": "FILLER allows for reserving space (such as blank spaces) in a structure without having to name the variable."},
                        {"id": "m4-q4-a4", "text": "To finish the record declaration.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "The instruction ''MOVE A TO B'' has been executed. Which statement is correct?",
                    "answers": [
                        {"id": "m4-q5-a1", "text": "B now contains the value of A.", "isCorrect": true},
                        {"id": "m4-q5-a2", "text": "A is now empty.", "isCorrect": false},
                        {"id": "m4-q5-a3", "text": "A and B have exchanged their respective contents.", "isCorrect": false},
                        {"id": "m4-q5-a4", "text": "B now contains the memory address of A.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the primary use of the INITIALIZE instruction on a group variable?",
                    "answers": [
                        {"id": "m4-q6-a1", "text": "To ask the user to enter default values.", "isCorrect": false},
                        {"id": "m4-q6-a2", "text": "Set all numeric fields to 0 and alphanumeric fields to SPACES.", "isCorrect": true, "explanation": "INITIALIZE resets sub-fields according to their default type."},
                        {"id": "m4-q6-a3", "text": "Set all fields to the value ''NULL''.", "isCorrect": false},
                        {"id": "m4-q6-a4", "text": "Erase the variable from the RAM.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "To add 5 to the variable ''NB-LINES'', which Cobol instruction is syntactically correct?",
                    "answers": [
                        {"id": "m4-q7-a1", "text": "COMPUTE NB-LINES + 5", "isCorrect": false},
                        {"id": "m4-q7-a2", "text": "SET NB-LINES TO NB-LINES + 5", "isCorrect": false},
                        {"id": "m4-q7-a3", "text": "ADD 5 TO NB-LINES", "isCorrect": true, "explanation": "It is the classic imperative syntax for simple addition."},
                        {"id": "m4-q7-a4", "text": "MOVE 5 TO NB-LINES", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "Which instruction should be used to read a value passed in SYSIN?",
                    "answers": [
                        {"id": "m4-q8-a1", "text": "GET", "isCorrect": false},
                        {"id": "m4-q8-a2", "text": "READ", "isCorrect": false},
                        {"id": "m4-q8-a3", "text": "DISPLAY", "isCorrect": false},
                        {"id": "m4-q8-a4", "text": "ACCEPT", "isCorrect": true}
                    ]
                },
                {
                    "id": "m4-q9",
                    "type": "SINGLE_CHOICE",
                    "text": "In a COBOL program, what is a section in the PROCEDURE DIVISION?",
                    "answers": [
                        {"id": "m4-q9-a1", "text": "An alternative division.", "isCorrect": false},
                        {"id": "m4-q9-a2", "text": "A specific comment line.", "isCorrect": false},
                        {"id": "m4-q9-a3", "text": "A logical grouping of several paragraphs.", "isCorrect": true, "explanation": "A section starts with a name followed by the word SECTION and contains one or more paragraphs."},
                        {"id": "m4-q9-a4", "text": "A global variable.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q10",
                    "type": "SINGLE_CHOICE",
                    "text": "What is a level-88 variable called?",
                    "answers": [
                        {"id": "m4-q10-a1", "text": "A condition name.", "isCorrect": true},
                        {"id": "m4-q10-a2", "text": "A file pointer.", "isCorrect": false},
                        {"id": "m4-q10-a3", "text": "A group constant.", "isCorrect": false},
                        {"id": "m4-q10-a4", "text": "An index variable.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q11",
                    "type": "SINGLE_CHOICE",
                    "text": "What structure is recommended to replace multiple nested IFs testing the same variable?",
                    "answers": [
                        {"id": "m4-q11-a1", "text": "GO TO", "isCorrect": false},
                        {"id": "m4-q11-a2", "text": "SEARCH", "isCorrect": false},
                        {"id": "m4-q11-a3", "text": "EVALUATE", "isCorrect": true, "explanation": "EVALUATE is the equivalent of ''Select Case'' or ''Switch'', offering better readability."},
                        {"id": "m4-q11-a4", "text": "PERFORM UNTIL", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q12",
                    "type": "SINGLE_CHOICE",
                    "text": "If you have ''01 WS-NOTE PIC 99''. What happens if you do ''MOVE 105 TO WS-NOTE''?",
                    "answers": [
                        {"id": "m4-q12-a1", "text": "The program stops immediately with a fatal error.", "isCorrect": false},
                        {"id": "m4-q12-a2", "text": "The value is truncated, WS-NOTE will contain 05.", "isCorrect": true},
                        {"id": "m4-q12-a3", "text": "The value 105 is stored normally.", "isCorrect": false},
                        {"id": "m4-q12-a4", "text": "The variable automatically expands to store 105.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q13",
                    "type": "SINGLE_CHOICE",
                    "text": "In which area must a paragraph name begin?",
                    "answers": [
                        {"id": "m4-q13-a1", "text": "Area B (columns 12 to 72).", "isCorrect": false},
                        {"id": "m4-q13-a2", "text": "Anywhere after column 7.", "isCorrect": false},
                        {"id": "m4-q13-a3", "text": "Area A (columns 8 to 11).", "isCorrect": true, "explanation": "Division, section, and paragraph names must start in Area A."},
                        {"id": "m4-q13-a4", "text": "Sequence area (columns 1 to 6).", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q14",
                    "type": "SINGLE_CHOICE",
                    "text": "What does the ''IF WS-PRICE NOT < 0'' instruction mean?",
                    "answers": [
                        {"id": "m4-q14-a1", "text": "It checks if the price is greater than or equal to zero.", "isCorrect": true, "explanation": "To say that it is not less than zero is the same as saying that it is positive or zero."},
                        {"id": "m4-q14-a2", "text": "It checks if the price is exactly equal to zero.", "isCorrect": false},
                        {"id": "m4-q14-a3", "text": "It is syntactically incorrect.", "isCorrect": false},
                        {"id": "m4-q14-a4", "text": "It checks if the price is strictly negative.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m4-q15",
                    "type": "SINGLE_CHOICE",
                    "text": "Which of these elements must mandatory end each division and each paragraph?",
                    "answers": [
                        {"id": "m4-q15-a1", "text": "A line break.", "isCorrect": false},
                        {"id": "m4-q15-a2", "text": "A period.", "isCorrect": true, "explanation": "The period is the structure terminator in COBOL."},
                        {"id": "m4-q15-a3", "text": "The keyword END.", "isCorrect": false},
                        {"id": "m4-q15-a4", "text": "A semicolon.", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 5 - JCL Basics =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 5 - JCL Basics';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 5 - JCL Basics', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - JCL Basics';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - JCL Basics', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Definitions', 'How to code an instruction?', 'JOB Statement', 'EXEC Statement', 'JOBLIB and STEPLIB', 'Return Code and MAXCC'],
            ARRAY['https://vimeo.com/1114769338?share=copy', 'https://vimeo.com/1114769368?share=copy', 'https://vimeo.com/1114769405?share=copy', 'https://vimeo.com/1114769487?share=copy', 'https://vimeo.com/1114769235?share=copy', 'https://vimeo.com/1114769293?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 5 - JCL Basics : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 5 - JCL Basics';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - JCL Basics';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m5-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "Which instruction is indispensable for naming a Job and submitting it to the system?",
                    "answers": [
                        {"id": "m5-q1-a1", "text": "//START", "isCorrect": false},
                        {"id": "m5-q1-a2", "text": "//JOB", "isCorrect": true, "explanation": "The JOB instruction is the first card of any JCL."},
                        {"id": "m5-q1-a3", "text": "//EXEC", "isCorrect": false},
                        {"id": "m5-q1-a4", "text": "//BEGIN", "isCorrect": false}
                    ]
                },
                {
                    "id": "m5-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "You want to run the \"SORT\" program to sort data. Which instruction do you use?",
                    "answers": [
                        {"id": "m5-q2-a1", "text": "//STEP1 RUN PGM=SORT", "isCorrect": false},
                        {"id": "m5-q2-a2", "text": "//STEP1 CALL PGM=SORT", "isCorrect": false},
                        {"id": "m5-q2-a3", "text": "//STEP1 EXEC PGM=SORT", "isCorrect": true, "explanation": "The EXEC (Execute) instruction defines a job step and allows a program to be executed."},
                        {"id": "m5-q2-a4", "text": "//STEP1 PROGRAM=SORT", "isCorrect": false}
                    ]
                },
                {
                    "id": "m5-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "Where must the JOBLIB instruction be placed so that it is valid for all steps?",
                    "answers": [
                        {"id": "m5-q3-a1", "text": "At the very end of the JCL.", "isCorrect": false},
                        {"id": "m5-q3-a2", "text": "Immediately after the JOB card.", "isCorrect": true},
                        {"id": "m5-q3-a3", "text": "After each EXEC instruction.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m5-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "The STEPLIB instruction is used to specify a program library...",
                    "answers": [
                        {"id": "m5-q4-a1", "text": "For the entire Job only.", "isCorrect": false},
                        {"id": "m5-q4-a2", "text": "Only for the step that contains it.", "isCorrect": true, "explanation": "The STEPLIB is local to a step and overrides the JOBLIB for that specific step."},
                        {"id": "m5-q4-a3", "text": "For all the user''s Jobs.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m5-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "Which return code (RC) is considered a total success without any warning messages?",
                    "answers": [
                        {"id": "m5-q5-a1", "text": "RC 0", "isCorrect": true, "explanation": "RC 0 means \"perfect execution\" (RC 4 is a simple warning)."},
                        {"id": "m5-q5-a2", "text": "RC 4", "isCorrect": false},
                        {"id": "m5-q5-a3", "text": "RC 8", "isCorrect": false},
                        {"id": "m5-q5-a4", "text": "RC 100", "isCorrect": false}
                    ]
                },
                {
                    "id": "m5-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "If your Job has three steps with the following codes: Step1 (RC=0), Step2 (RC=8), Step3 (RC=4). What will be the displayed MAXCC at the end?",
                    "answers": [
                        {"id": "m5-q6-a1", "text": "0", "isCorrect": false},
                        {"id": "m5-q6-a2", "text": "4", "isCorrect": false},
                        {"id": "m5-q6-a3", "text": "12", "isCorrect": false},
                        {"id": "m5-q6-a4", "text": "8", "isCorrect": true, "explanation": "The MAXCC retains the highest (most critical) value encountered."}
                    ]
                },
                {
                    "id": "m5-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "How do you write a comment to explain what a line of code does?",
                    "answers": [
                        {"id": "m5-q7-a1", "text": "# This is a comment", "isCorrect": false},
                        {"id": "m5-q7-a2", "text": "// This is a comment", "isCorrect": false},
                        {"id": "m5-q7-a3", "text": "//* This is a comment", "isCorrect": true, "explanation": "In JCL, comments always start with //*."},
                        {"id": "m5-q7-a4", "text": "-- This is a comment", "isCorrect": false}
                    ]
                },
                {
                    "id": "m5-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the utility of the // line (double slashes alone) at the end of the Job?",
                    "answers": [
                        {"id": "m5-q8-a1", "text": "It is used to restart the Job.", "isCorrect": false},
                        {"id": "m5-q8-a2", "text": "It marks the end of the Job.", "isCorrect": true},
                        {"id": "m5-q8-a3", "text": "It causes an intentional error.", "isCorrect": false},
                        {"id": "m5-q8-a4", "text": "It is used to cancel the Job.", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 6 - Files and Libraries =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 6 - Files and Libraries';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 6 - Files and Libraries', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Files and Libraries';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - Files and Libraries', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['File types', 'How to create a sequential file?', 'How to create a PDS?', 'Naming Convention', 'The Catalog', 'How to declare a file in a program?', 'File Description', 'OPEN & CLOSE', 'File Status', 'How to read a file?', 'DD Statement', 'How to write into a file?', 'Instream dataset', 'SYSIN', 'SYSOUT'],
            ARRAY['https://vimeo.com/1114769601?share=copy', 'https://vimeo.com/1114769633?share=copy', 'https://vimeo.com/1114769718?share=copy', 'https://vimeo.com/1114769767?share=copy', 'https://vimeo.com/1114769795?share=copy', 'https://vimeo.com/1114769849?share=copy', 'https://vimeo.com/1114769906?share=copy', 'https://vimeo.com/1114769948?share=copy', 'https://vimeo.com/1114769975?share=copy', 'https://vimeo.com/1114770023?share=copy', 'https://vimeo.com/1114770122?share=copy', 'https://vimeo.com/1114770236?share=copy', 'https://vimeo.com/1114770478?share=copy', 'https://vimeo.com/1114769519?share=copy', 'https://vimeo.com/1114769541?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 6 - Files and Libraries : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 6 - Files and Libraries';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Files and Libraries';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m6-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main physical and logical difference between a PS (Physical Sequential) file and a PDS (Partitioned Data Set) under z/OS?",
                    "answers": [
                        {"id": "m6-q1-a1", "text": "A PDS can only be stored on magnetic tapes, whereas a PS file is always stored on hard disks (DASD).", "isCorrect": false},
                        {"id": "m6-q1-a2", "text": "A PS file is used exclusively for source code and a PDS for the transactional data of databases.", "isCorrect": false},
                        {"id": "m6-q1-a3", "text": "There is no structural difference; the name depends only on the programming language that uses them (COBOL or Assembler).", "isCorrect": false},
                        {"id": "m6-q1-a4", "text": "A PDS acts as a directory containing several members (which are like sequential sub-files), whereas a PS is a single file of continuous data.", "isCorrect": true}
                    ]
                },
                {
                    "id": "m6-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main role of the Catalog with regard to Data Set Names (DSN)?",
                    "answers": [
                        {"id": "m6-q2-a1", "text": "It stores the object code generated after compiling a COBOL program.", "isCorrect": false},
                        {"id": "m6-q2-a2", "text": "It defines the access rights and passwords for each file in the system.", "isCorrect": false},
                        {"id": "m6-q2-a3", "text": "It records on which physical volume (disk or tape) a file is stored, making it possible to find it using only its DSN.", "isCorrect": true, "explanation": "The catalog acts as a directory. If a file is cataloged, we do not need to specify the volume to find the file; the system knows where to look."},
                        {"id": "m6-q2-a4", "text": "It automatically archives old files to free up space.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "After executing a read statement (READ) on a sequential file, which FILE STATUS value indicates that the end of the file (EOF) has been reached?",
                    "answers": [
                        {"id": "m6-q3-a1", "text": "99", "isCorrect": false},
                        {"id": "m6-q3-a2", "text": "00", "isCorrect": false},
                        {"id": "m6-q3-a3", "text": "22", "isCorrect": false},
                        {"id": "m6-q3-a4", "text": "10", "isCorrect": true, "explanation": "The status code \"10\" signals the end of the file (End Of File) in a normal way. It is the classic stop condition of a read loop."}
                    ]
                },
                {
                    "id": "m6-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "When running a COBOL program through a JCL, what is the purpose of the DD (Data Definition) statement?",
                    "answers": [
                        {"id": "m6-q4-a1", "text": "It compiles the COBOL source code to detect syntax errors.", "isCorrect": false},
                        {"id": "m6-q4-a2", "text": "It formats the mainframe disks to prepare them to receive a new PS file.", "isCorrect": false},
                        {"id": "m6-q4-a3", "text": "It triggers the execution of the COBOL program by calling its Load Module.", "isCorrect": false},
                        {"id": "m6-q4-a4", "text": "It maps the internal file name used in the COBOL code (the DDNAME) to the actual physical file (DSN) on z/OS.", "isCorrect": true, "explanation": "In the COBOL program, the ASSIGN TO clause points to a name of at most eight characters. In the JCL, the DD statement uses that same name to tell the system which Data Set to handle."}
                    ]
                },
                {
                    "id": "m6-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "How do you declare an \"Instream\" file (data entered directly inside the JCL) so that it can be read by a program?",
                    "answers": [
                        {"id": "m6-q5-a1", "text": "//DDNAME DD DSN=INSTREAM,DISP=SHR", "isCorrect": false},
                        {"id": "m6-q5-a2", "text": "//DDNAME DD *", "isCorrect": true, "explanation": "The asterisk (*) after DD tells the system that the data immediately following this line (up to the /* delimiter) is the content of the input file."},
                        {"id": "m6-q5-a3", "text": "//DDNAME DD DATA=INLINE", "isCorrect": false},
                        {"id": "m6-q5-a4", "text": "//DDNAME DD SYSOUT=*", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "To generate a report (print file) and send it to the z/OS Spool (viewable via SDSF) from a JCL, which syntax is the most commonly used?",
                    "answers": [
                        {"id": "m6-q6-a1", "text": "//OUTFILE DD DEST=PRINTER1", "isCorrect": false},
                        {"id": "m6-q6-a2", "text": "//OUTFILE DD SYSOUT=*", "isCorrect": true, "explanation": "The SYSOUT parameter directs the output file to JES (Job Entry Subsystem)."},
                        {"id": "m6-q6-a3", "text": "//OUTFILE DD DSN=PRINTER.OUT,DISP=NEW", "isCorrect": false},
                        {"id": "m6-q6-a4", "text": "//OUTFILE DD *", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "In a COBOL program, which division and section are responsible for associating the program''s internal file name with the external name (the JCL DDNAME)?",
                    "answers": [
                        {"id": "m6-q7-a1", "text": "The PROCEDURE DIVISION, during the OPEN statement.", "isCorrect": false},
                        {"id": "m6-q7-a2", "text": "The ENVIRONMENT DIVISION, in the INPUT-OUTPUT SECTION.", "isCorrect": true, "explanation": "It is in the ENVIRONMENT DIVISION (specifically the FILE-CONTROL paragraph) that the \"SELECT internal-file-name ASSIGN TO DDNAME\" clause is declared, which creates the link with the external environment."},
                        {"id": "m6-q7-a3", "text": "The DATA DIVISION, in the FILE SECTION.", "isCorrect": false},
                        {"id": "m6-q7-a4", "text": "The IDENTIFICATION DIVISION, under PROGRAM-ID.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "If your COBOL program''s job is to read data from an existing sequential file without modifying it, which open mode must you code?",
                    "answers": [
                        {"id": "m6-q8-a1", "text": "OPEN I-O file-name", "isCorrect": false},
                        {"id": "m6-q8-a2", "text": "OPEN INPUT file-name", "isCorrect": true, "explanation": "The INPUT mode opens the file in read-only mode. The file must be opened in this mode if you want to use the READ statement."},
                        {"id": "m6-q8-a3", "text": "OPEN EXTEND file-name", "isCorrect": false},
                        {"id": "m6-q8-a4", "text": "OPEN OUTPUT file-name", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q9",
                    "type": "SINGLE_CHOICE",
                    "text": "When creating a sequential file in a JCL, you use DISP=(NEW,CATLG,DELETE). What happens if the COBOL program crashes (ABEND) during this step?",
                    "answers": [
                        {"id": "m6-q9-a1", "text": "The system will first delete the old file if it already existed with the same name, before creating the new one.", "isCorrect": false},
                        {"id": "m6-q9-a2", "text": "The file being created will be deleted from the system so as not to leave an incomplete or corrupted file.", "isCorrect": true, "explanation": "The third DISP subparameter defines the action to take on abnormal termination (ABEND). DELETE removes the file, which makes it easier to rerun the job without a \"Duplicate Data Set\" error."},
                        {"id": "m6-q9-a3", "text": "The file will be automatically deleted at the end of the week during system maintenance.", "isCorrect": false},
                        {"id": "m6-q9-a4", "text": "It gives the COBOL program the right to physically delete lines inside the sequential file.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q10",
                    "type": "SINGLE_CHOICE",
                    "text": "In a COBOL program, after executing an I/O statement (such as a READ or a WRITE), which FILE STATUS code indicates that the operation completed successfully with no error at all?",
                    "answers": [
                        {"id": "m6-q10-a1", "text": "04", "isCorrect": false},
                        {"id": "m6-q10-a2", "text": "10", "isCorrect": false},
                        {"id": "m6-q10-a3", "text": "99", "isCorrect": false},
                        {"id": "m6-q10-a4", "text": "00", "isCorrect": true, "explanation": "The code \"00\" means ''Successful completion''. It is the code the developer must check to make sure the operation went well before processing the data."}
                    ]
                },
                {
                    "id": "m6-q11",
                    "type": "SINGLE_CHOICE",
                    "text": "In a JCL, when creating a sequential file, which parameters of the DD statement define, respectively, the length of a record and the format of that record (fixed or variable)?",
                    "answers": [
                        {"id": "m6-q11-a1", "text": "LRECL and RECFM", "isCorrect": true, "explanation": "LRECL (Logical Record Length) defines the size in bytes of a line, and RECFM (Record Format) defines whether that size is fixed (F/FB) or variable (V/VB)."},
                        {"id": "m6-q11-a2", "text": "BLKSIZE and SPACE", "isCorrect": false},
                        {"id": "m6-q11-a3", "text": "UNIT and VOL", "isCorrect": false},
                        {"id": "m6-q11-a4", "text": "DSN and DISP", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q12",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the syntax rule in COBOL regarding the WRITE statement compared to the READ statement?",
                    "answers": [
                        {"id": "m6-q12-a1", "text": "The WRITE statement must always be accompanied by the REWRITE statement to work.", "isCorrect": false},
                        {"id": "m6-q12-a2", "text": "You write a file (WRITE file-name) but you read a record (READ record-name).", "isCorrect": false},
                        {"id": "m6-q12-a3", "text": "You read a file (READ file-name), but you write a record (WRITE record-name).", "isCorrect": true, "explanation": "This is a peculiarity of the COBOL language: the READ statement takes the name of the FD (File Description) as a parameter, whereas WRITE takes the name of the data structure (record) defined under that FD (the 01 level)."},
                        {"id": "m6-q12-a4", "text": "You read and write using exactly the same name, that of the file (FD).", "isCorrect": false}
                    ]
                },
                {
                    "id": "m6-q13",
                    "type": "SINGLE_CHOICE",
                    "text": "Which of these rules about the syntax of a Data Set Name (DSN) under z/OS is true?",
                    "answers": [
                        {"id": "m6-q13-a1", "text": "It can contain up to 44 characters, separated by periods, where each segment (qualifier) does not exceed 8 characters.", "isCorrect": true, "explanation": "This is the strict DSN standard under z/OS. For example, PROJ.TEST.DATA.FILE123 follows this rule (44 characters maximum in total, and no word between the periods exceeds 8 characters)."},
                        {"id": "m6-q13-a2", "text": "It accepts spaces and most special characters (!, ?, *) anywhere in the name.", "isCorrect": false},
                        {"id": "m6-q13-a3", "text": "There is no size limit, as long as it is written in uppercase letters.", "isCorrect": false},
                        {"id": "m6-q13-a4", "text": "It must necessarily start with the identifier (USERID) of the programmer who created it.", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 7 - Cobol – Advanced Concepts =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 7 - Cobol – Advanced Concepts';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 7 - Cobol – Advanced Concepts', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Cobol – Advanced Concepts';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - Cobol – Advanced Concepts', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Reference Modification', 'STRING Statement', 'UNSTRING Statement', 'INSPECT Statement', 'Signed Numbers', 'Decimal Numbers', 'Edited Numbers', 'COMP data types', 'Redefines', 'Work with Tables', 'Table index', 'SEARCH Statement', '🔨 Exercise: Work with tables', 'Work with Multi-Level Tables', 'COPY', 'Subprograms', 'Functions', '🔨 Exercise: Subprograms and Functions', 'How to debug a program?'],
            ARRAY['https://vimeo.com/1110667927?share=copy', 'https://vimeo.com/1110667932?share=copy', 'https://vimeo.com/1110667942?share=copy', 'https://vimeo.com/1110667951?share=copy', 'https://vimeo.com/1110667955?share=copy', 'https://vimeo.com/1110667960?share=copy', 'https://vimeo.com/1110667965?share=copy', 'https://vimeo.com/1110667972?share=copy', 'https://vimeo.com/1110667981?share=copy', 'https://vimeo.com/1110667996?share=copy', 'https://vimeo.com/1110668006?share=copy', 'https://vimeo.com/1110668014?share=copy', 'https://vimeo.com/1110668022?share=copy', 'https://vimeo.com/1110668025?share=copy', 'https://vimeo.com/1110668042?share=copy', 'https://vimeo.com/1110668054?share=copy', 'https://vimeo.com/1110668064?share=copy', 'https://vimeo.com/1110668073?share=copy', 'https://vimeo.com/1110668080?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 7 - Cobol – Advanced Concepts : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 7 - Cobol – Advanced Concepts';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - Cobol – Advanced Concepts';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m7-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "How do you extract the first 3 characters of a variable named WS-TEXT using reference modification?",
                    "answers": [
                        {"id": "m7-q1-a1", "text": "SUBSTR(WS-TEXT, 1, 3)", "isCorrect": false},
                        {"id": "m7-q1-a2", "text": "WS-TEXT[1:3]", "isCorrect": false},
                        {"id": "m7-q1-a3", "text": "WS-TEXT(1:3)", "isCorrect": true, "explanation": "The correct syntax is Variable(StartPosition:Length)."},
                        {"id": "m7-q1-a4", "text": "WS-TEXT(3:1)", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "In the reference modification expression WS-TEXT(5:2), what does the number 2 represent?",
                    "answers": [
                        {"id": "m7-q2-a1", "text": "The increment step.", "isCorrect": false},
                        {"id": "m7-q2-a2", "text": "The length (the number of characters) to extract.", "isCorrect": true},
                        {"id": "m7-q2-a3", "text": "The table index.", "isCorrect": false},
                        {"id": "m7-q2-a4", "text": "The end position of the extraction.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "Which statement is used to concatenate several character strings into a single variable?",
                    "answers": [
                        {"id": "m7-q3-a1", "text": "STRING", "isCorrect": true, "explanation": "The STRING statement allows several alphanumeric variables to be joined into a destination variable."},
                        {"id": "m7-q3-a2", "text": "COMBINE", "isCorrect": false},
                        {"id": "m7-q3-a3", "text": "CONCATENATE", "isCorrect": false},
                        {"id": "m7-q3-a4", "text": "JOIN", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main role of the UNSTRING statement?",
                    "answers": [
                        {"id": "m7-q4-a1", "text": "To undo the last STRING operation performed.", "isCorrect": false},
                        {"id": "m7-q4-a2", "text": "To remove the trailing spaces of a character string.", "isCorrect": false},
                        {"id": "m7-q4-a3", "text": "To split a character string into several destination variables according to a separator.", "isCorrect": true, "explanation": "UNSTRING breaks a source string up into several target fields based on one or more delimiters."},
                        {"id": "m7-q4-a4", "text": "To convert a numeric variable into a character string.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "With the UNSTRING statement, which clause is used to specify the character(s) that separate the source data?",
                    "answers": [
                        {"id": "m7-q5-a1", "text": "SEPARATED BY", "isCorrect": false},
                        {"id": "m7-q5-a2", "text": "SPLIT BY", "isCorrect": false},
                        {"id": "m7-q5-a3", "text": "DIVIDED BY", "isCorrect": false},
                        {"id": "m7-q5-a4", "text": "DELIMITED BY", "isCorrect": true, "explanation": "The DELIMITED BY clause tells the program which character (e.g. a space, a comma) marks the end of a piece of data to extract."}
                    ]
                },
                {
                    "id": "m7-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "Which statement allows you to count the number of occurrences of a specific character in a variable?",
                    "answers": [
                        {"id": "m7-q6-a1", "text": "EXAMINE ... COUNTING", "isCorrect": false},
                        {"id": "m7-q6-a2", "text": "COMPUTE ... TALLY", "isCorrect": false},
                        {"id": "m7-q6-a3", "text": "INSPECT ... TALLYING", "isCorrect": true, "explanation": "The TALLYING clause of the INSPECT statement is specifically designed to count occurrences."},
                        {"id": "m7-q6-a4", "text": "COUNT CHARACTERS", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "Which syntax of the INSPECT statement replaces all spaces with zeroes in a variable?",
                    "answers": [
                        {"id": "m7-q7-a1", "text": "REPLACE SPACES BY ZEROES IN variable", "isCorrect": false},
                        {"id": "m7-q7-a2", "text": "CHANGE variable SPACES TO ZEROES", "isCorrect": false},
                        {"id": "m7-q7-a3", "text": "INSPECT variable REPLACING ALL SPACES BY ZEROES", "isCorrect": true, "explanation": "This is the exact syntax to perform a global search and replace of one character by another."},
                        {"id": "m7-q7-a4", "text": "INSPECT variable SUBSTITUTE SPACES WITH ZEROES", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "Which symbol is used in the PICTURE (PIC) clause to indicate that a number is signed (positive or negative)?",
                    "answers": [
                        {"id": "m7-q8-a1", "text": "M", "isCorrect": false},
                        {"id": "m7-q8-a2", "text": "S", "isCorrect": true, "explanation": "The \"S\" symbol placed at the beginning of the PIC clause indicates that the variable can hold a negative or positive value during calculations."},
                        {"id": "m7-q8-a3", "text": "V", "isCorrect": false},
                        {"id": "m7-q8-a4", "text": "-", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q9",
                    "type": "SINGLE_CHOICE",
                    "text": "Which of these editing symbols (PIC) is used to replace non-significant (leading) zeros with spaces?",
                    "answers": [
                        {"id": "m7-q9-a1", "text": "N", "isCorrect": false},
                        {"id": "m7-q9-a2", "text": "Z", "isCorrect": true},
                        {"id": "m7-q9-a3", "text": "9", "isCorrect": false},
                        {"id": "m7-q9-a4", "text": "X", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q10",
                    "type": "SINGLE_CHOICE",
                    "text": "What does the COMP (COMPUTATIONAL) format mean for a numeric variable?",
                    "answers": [
                        {"id": "m7-q10-a1", "text": "The number is stored in pure binary form to optimize calculation performance.", "isCorrect": true, "explanation": "COMP stores integers in binary, which speeds up mathematical operations."},
                        {"id": "m7-q10-a2", "text": "The number is formatted with commas and periods for display.", "isCorrect": false},
                        {"id": "m7-q10-a3", "text": "The number is stored as ASCII text.", "isCorrect": false},
                        {"id": "m7-q10-a4", "text": "The number is stored in extended decimal form.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q11",
                    "type": "SINGLE_CHOICE",
                    "text": "Which clause is used to define a table (array) in COBOL?",
                    "answers": [
                        {"id": "m7-q11-a1", "text": "ARRAY", "isCorrect": false},
                        {"id": "m7-q11-a2", "text": "DIMENSION", "isCorrect": false},
                        {"id": "m7-q11-a3", "text": "OCCURS", "isCorrect": true, "explanation": "The OCCURS clause indicates how many times a data item is repeated to form a table."},
                        {"id": "m7-q11-a4", "text": "TABLE", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q12",
                    "type": "SINGLE_CHOICE",
                    "text": "Which clause is mandatory in the definition of a table (OCCURS) in order to use the (sequential) SEARCH statement?",
                    "answers": [
                        {"id": "m7-q12-a1", "text": "POINTER IS", "isCorrect": false},
                        {"id": "m7-q12-a2", "text": "KEY IS", "isCorrect": false},
                        {"id": "m7-q12-a3", "text": "SUBSCRIPTED BY", "isCorrect": false},
                        {"id": "m7-q12-a4", "text": "INDEXED BY", "isCorrect": true, "explanation": "The SEARCH statement requires an index defined via INDEXED BY in order to traverse the table automatically."}
                    ]
                },
                {
                    "id": "m7-q13",
                    "type": "SINGLE_CHOICE",
                    "text": "How do you access a specific element (e.g. row 2, column 3) in a two-dimensional table named MATRIX?",
                    "answers": [
                        {"id": "m7-q13-a1", "text": "MATRIX-2-3", "isCorrect": false},
                        {"id": "m7-q13-a2", "text": "MATRIX OF 2 AND 3", "isCorrect": false},
                        {"id": "m7-q13-a3", "text": "MATRIX [2] [3]", "isCorrect": false},
                        {"id": "m7-q13-a4", "text": "MATRIX(2, 3)", "isCorrect": true, "explanation": "In COBOL, subscripts are written in parentheses, separated by a comma (and an optional space)."}
                    ]
                },
                {
                    "id": "m7-q14",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the COPY statement used for?",
                    "answers": [
                        {"id": "m7-q14-a1", "text": "To save the current state of the program in case of a crash.", "isCorrect": false},
                        {"id": "m7-q14-a2", "text": "To copy the content of a physical file to another file.", "isCorrect": false},
                        {"id": "m7-q14-a3", "text": "To duplicate a variable in memory while the program is running.", "isCorrect": false},
                        {"id": "m7-q14-a4", "text": "To include external source code (a copybook) during the compilation phase.", "isCorrect": true, "explanation": "The COPY statement tells the compiler to insert the content of another source file at that exact spot."}
                    ]
                },
                {
                    "id": "m7-q15",
                    "type": "SINGLE_CHOICE",
                    "text": "Which statement is used to call an external subprogram while passing it parameters?",
                    "answers": [
                        {"id": "m7-q15-a1", "text": "CALL ... USING", "isCorrect": true, "explanation": "CALL runs a subprogram, and USING specifies which variables are shared (passed as arguments)."},
                        {"id": "m7-q15-a2", "text": "EXECUTE ... PASSING", "isCorrect": false},
                        {"id": "m7-q15-a3", "text": "PERFORM ... WITH", "isCorrect": false},
                        {"id": "m7-q15-a4", "text": "INVOKE ... USING", "isCorrect": false}
                    ]
                },
                {
                    "id": "m7-q16",
                    "type": "SINGLE_CHOICE",
                    "text": "In a called subprogram, where must the variables received as parameters necessarily be declared?",
                    "answers": [
                        {"id": "m7-q16-a1", "text": "In the LOCAL-STORAGE SECTION.", "isCorrect": false},
                        {"id": "m7-q16-a2", "text": "In the LINKAGE SECTION.", "isCorrect": true, "explanation": "The LINKAGE SECTION defines the structure of the data that points to the memory allocated by the calling program."},
                        {"id": "m7-q16-a3", "text": "In the FILE SECTION.", "isCorrect": false},
                        {"id": "m7-q16-a4", "text": "In the WORKING-STORAGE SECTION.", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 8 - DB2 with Cobol =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 8 - DB2 with Cobol';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 8 - DB2 with Cobol', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - DB2 with Cobol';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - DB2 with Cobol', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['DB2 – A Relational Database', 'Data Types', 'SQL Essentials', 'SPUFI', 'How to use SQL in a Cobol Program?', 'SQL in Cobol Program in Practice', 'DCLGEN', 'CURSOR', '🔨 Exercise: A program using a cursor', 'Work with VARCHAR', 'How to handle NULL?', '🔨 Project New Order – Presentation', '🔨 Project New Order – Table and File Creation', '🔨 Project New Order – The COBORDER Program', '🔨 Project New Order – Compilation and Run', 'DSNTIAR'],
            ARRAY['https://vimeo.com/1110512886?share=copy', 'https://vimeo.com/1110512897?share=copy', 'https://vimeo.com/1110512909?share=copy', 'https://vimeo.com/1110512919?share=copy', 'https://vimeo.com/1110512942?share=copy', 'https://vimeo.com/1110512955?share=copy', 'https://vimeo.com/1110512990?share=copy', 'https://vimeo.com/1110513008?share=copy', 'https://vimeo.com/1110513025?share=copy', 'https://vimeo.com/1110513061?share=copy', 'https://vimeo.com/1110513091?share=copy', 'https://vimeo.com/1110513119?share=copy', 'https://vimeo.com/1110513126?share=copy', 'https://vimeo.com/1110513148?share=copy', 'https://vimeo.com/1110512843?share=copy', 'https://vimeo.com/1110512859?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 8 - DB2 with Cobol : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 8 - DB2 with Cobol';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - DB2 with Cobol';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m8-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "In a COBOL program, how must you delimit an SQL statement so that it is recognized by the DB2 precompiler?",
                    "answers": [
                        {"id": "m8-q1-a1", "text": "EXEC SQL ... END-EXEC.", "isCorrect": true, "explanation": "This is the standard and mandatory syntax to embed SQL code in a COBOL program."},
                        {"id": "m8-q1-a2", "text": "BEGIN SQL ... END SQL;", "isCorrect": false},
                        {"id": "m8-q1-a3", "text": "SQL BEGIN ... SQL END.", "isCorrect": false},
                        {"id": "m8-q1-a4", "text": "START SQL ... STOP SQL.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m8-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "When compiling a COBOL/DB2 program, which step is responsible for extracting the SQL queries to generate the DBRM (Database Request Module)?",
                    "answers": [
                        {"id": "m8-q2-a1", "text": "The link-edit", "isCorrect": false},
                        {"id": "m8-q2-a2", "text": "The DB2 precompilation", "isCorrect": true, "explanation": "The precompiler analyzes the program, comments out the SQL statements, inserts calls to DB2 and generates the DBRM containing the SQL code."},
                        {"id": "m8-q2-a3", "text": "The BIND step", "isCorrect": false},
                        {"id": "m8-q2-a4", "text": "The NEWCOPY", "isCorrect": false}
                    ]
                },
                {
                    "id": "m8-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main role of the DCLGEN utility?",
                    "answers": [
                        {"id": "m8-q3-a1", "text": "To create the physical structure of the tables in the database.", "isCorrect": false},
                        {"id": "m8-q3-a2", "text": "To load data from a sequential file into DB2.", "isCorrect": false},
                        {"id": "m8-q3-a3", "text": "To generate the data access plan during the BIND.", "isCorrect": false},
                        {"id": "m8-q3-a4", "text": "To automatically generate the COBOL data structure (COPY) corresponding to a DB2 table.", "isCorrect": true}
                    ]
                },
                {
                    "id": "m8-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "How is a DB2 column defined as VARCHAR(50) translated into COBOL by DCLGEN?",
                    "answers": [
                        {"id": "m8-q4-a1", "text": "Into a table OCCURS 50 TIMES PIC X.", "isCorrect": false},
                        {"id": "m8-q4-a2", "text": "Into a simple variable PIC X(50).", "isCorrect": false},
                        {"id": "m8-q4-a3", "text": "Into a packed field PIC S9(50) COMP-3.", "isCorrect": false},
                        {"id": "m8-q4-a4", "text": "Into a group level containing an integer for the length (PIC S9(4) COMP) and a string for the data (PIC X(50)).", "isCorrect": true, "explanation": "This structure allows DB2 and COBOL to communicate the exact size of the useful data."}
                    ]
                },
                {
                    "id": "m8-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "In an exercise listing the \"Employees by Department\", you must retrieve several employees for the same department code. Which SQL mechanism is essential in COBOL for this processing?",
                    "answers": [
                        {"id": "m8-q5-a1", "text": "The declaration of an extended SQLCA variable.", "isCorrect": false},
                        {"id": "m8-q5-a2", "text": "The EXEC SQL FETCH ALL statement.", "isCorrect": false},
                        {"id": "m8-q5-a3", "text": "The use of a CURSOR (DECLARE, OPEN, FETCH, CLOSE).", "isCorrect": true, "explanation": "The cursor makes it possible to create a result set and to traverse it row by row using the FETCH statement."},
                        {"id": "m8-q5-a4", "text": "A simple EXEC SQL SELECT INTO ... END-EXEC.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m8-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main purpose of the EXEC SQL COMMIT END-EXEC command in a batch program?",
                    "answers": [
                        {"id": "m8-q6-a1", "text": "To permanently validate the updates in the database and release the locks.", "isCorrect": true, "explanation": "The COMMIT synchronizes the data, secures the transaction and releases the resources for other users."},
                        {"id": "m8-q6-a2", "text": "To cancel the changes in case of a processing error.", "isCorrect": false},
                        {"id": "m8-q6-a3", "text": "To abruptly terminate the execution of the program.", "isCorrect": false},
                        {"id": "m8-q6-a4", "text": "To open all the cursors declared in the WORKING-STORAGE.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m8-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "Why is restart management (with regular COMMIT points) crucial in a heavy batch process modifying millions of rows?",
                    "answers": [
                        {"id": "m8-q7-a1", "text": "To speed up the compilation time of the program.", "isCorrect": false},
                        {"id": "m8-q7-a2", "text": "Because DB2 imposes a strict limit of 100 UPDATE queries per program.", "isCorrect": false},
                        {"id": "m8-q7-a3", "text": "To prevent the DSNTEP2 utility from running at the same time.", "isCorrect": false},
                        {"id": "m8-q7-a4", "text": "To allow the job to be restarted from the last committed point in case of a crash.", "isCorrect": true, "explanation": "Regular COMMITs avoid having to start over from the beginning if the program crashes."}
                    ]
                },
                {
                    "id": "m8-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "Which utility is commonly used to execute SQL statements (such as SELECT, INSERT or CREATE) in Batch mode?",
                    "answers": [
                        {"id": "m8-q8-a1", "text": "DSNTIAUL", "isCorrect": false, "explanation": "Not quite. DSNTIAUL is mainly used to unload data in bulk, not to execute SQL statements."},
                        {"id": "m8-q8-a2", "text": "DCLGEN", "isCorrect": false},
                        {"id": "m8-q8-a3", "text": "DSNTEP2", "isCorrect": true, "explanation": "DSNTEP2 is the utility program provided by IBM designed to execute SQL statements read from an input file (SYSIN)."},
                        {"id": "m8-q8-a4", "text": "LOAD", "isCorrect": false}
                    ]
                },
                {
                    "id": "m8-q9",
                    "type": "SINGLE_CHOICE",
                    "text": "If you want to unload (export) the content of a DB2 table to a sequential file efficiently, which IBM utility is the most suitable?",
                    "answers": [
                        {"id": "m8-q9-a1", "text": "DSNTEP2", "isCorrect": false},
                        {"id": "m8-q9-a2", "text": "DSNTIAUL", "isCorrect": false},
                        {"id": "m8-q9-a3", "text": "LOAD", "isCorrect": false},
                        {"id": "m8-q9-a4", "text": "UNLOAD", "isCorrect": true, "explanation": "This utility is the most efficient for extracting massive volumes of data from DB2 into flat files."}
                    ]
                },
                {
                    "id": "m8-q10",
                    "type": "SINGLE_CHOICE",
                    "text": "Among the following statements about the BIND step, which one is correct?",
                    "answers": [
                        {"id": "m8-q10-a1", "text": "The BIND translates the SQL queries into native COBOL statements.", "isCorrect": false},
                        {"id": "m8-q10-a2", "text": "The BIND analyzes the DBRM, determines the best data access path (index, scan) and stores this execution plan in DB2.", "isCorrect": true},
                        {"id": "m8-q10-a3", "text": "The BIND is an optional step if only cursors are used.", "isCorrect": false},
                        {"id": "m8-q10-a4", "text": "The BIND directly executes the COBOL program and displays the results.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m8-q11",
                    "type": "SINGLE_CHOICE",
                    "text": "When reading a cursor with the FETCH statement, how does the COBOL program detect that there are no more rows to read?",
                    "answers": [
                        {"id": "m8-q11-a1", "text": "The SQLCODE variable of the SQLCA equals 0.", "isCorrect": false},
                        {"id": "m8-q11-a2", "text": "The system automatically raises an S0C4 Abend.", "isCorrect": false},
                        {"id": "m8-q11-a3", "text": "The SQLCODE variable of the SQLCA equals 100.", "isCorrect": true, "explanation": "SQLCODE 100 is the standard value indicating \"No Data Found\" or the end of a cursor traversal."},
                        {"id": "m8-q11-a4", "text": "The SQLERRD(3) variable is set to -1.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m8-q12",
                    "type": "SINGLE_CHOICE",
                    "text": "In an SQL query embedded in COBOL (for example in a WHERE clause), how must you write the name of a WORKING-STORAGE variable to distinguish it from a DB2 column?",
                    "answers": [
                        {"id": "m8-q12-a1", "text": "By prefixing it with a colon (e.g. :WS-DEPT).", "isCorrect": true, "explanation": "The colon (:) tells the DB2 precompiler that it is a host variable defined in the program."},
                        {"id": "m8-q12-a2", "text": "By enclosing it in single quotes (e.g. ''WS-DEPT'').", "isCorrect": false},
                        {"id": "m8-q12-a3", "text": "By prefixing it with an at sign (e.g. @WS-DEPT).", "isCorrect": false},
                        {"id": "m8-q12-a4", "text": "By using the HOST() function (e.g. HOST(WS-DEPT)).", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 9 - JCL – Advanced Concepts =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 9 - JCL – Advanced Concepts';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 9 - JCL – Advanced Concepts', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - JCL – Advanced Concepts';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - JCL – Advanced Concepts', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['COND Parameter', 'IF Statement', 'Abend', 'How to code Procedures?', 'Symbolic Parameters', 'INCLUDE', 'DUMMY', 'IEFBR14', 'IEBGENER', 'IEBCOMPR', 'IDCAMS', '🔨 Exercise: Utility programs', 'The SORT Program', 'Temporary Datasets'],
            ARRAY['https://vimeo.com/1114694315?share=copy', 'https://vimeo.com/1114694427?share=copy', 'https://vimeo.com/1114694436?share=copy', 'https://vimeo.com/1114694449?share=copy', 'https://vimeo.com/1114694456?share=copy', 'https://vimeo.com/1114694468?share=copy', 'https://vimeo.com/1114694475?share=copy', 'https://vimeo.com/1114694490?share=copy', 'https://vimeo.com/1114694508?share=copy', 'https://vimeo.com/1114694520?share=copy', 'https://vimeo.com/1114694531?share=copy', 'https://vimeo.com/1114694546?share=copy', 'https://vimeo.com/1114694559?share=copy', 'https://vimeo.com/1114694578?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 9 - JCL – Advanced Concepts : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 9 - JCL – Advanced Concepts';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - JCL – Advanced Concepts';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m9-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main purpose of the COND parameter in a JOB or EXEC statement?",
                    "answers": [
                        {"id": "m9-q1-a1", "text": "To condition access to files", "isCorrect": false},
                        {"id": "m9-q1-a2", "text": "To define the security conditions of the job", "isCorrect": false},
                        {"id": "m9-q1-a3", "text": "To specify the maximum execution time", "isCorrect": false},
                        {"id": "m9-q1-a4", "text": "To allow or prevent the execution of a step depending on the return codes of the previous steps", "isCorrect": true, "explanation": "The COND parameter makes it possible to bypass a step if a logical condition based on the Return Code (RC) is true."}
                    ]
                },
                {
                    "id": "m9-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "In an IF-THEN-ELSE statement, which syntax is correct to test whether the return code of step STEP1 is equal to 0?",
                    "answers": [
                        {"id": "m9-q2-a1", "text": "// CHECK STEP1.RC = 0", "isCorrect": false},
                        {"id": "m9-q2-a2", "text": "// COND=(0,EQ,STEP1)", "isCorrect": false},
                        {"id": "m9-q2-a3", "text": "// IF STEP1.RC EQ 0", "isCorrect": false},
                        {"id": "m9-q2-a4", "text": "// IF (STEP1.RC = 0) THEN", "isCorrect": true, "explanation": "This is the standard syntax used in modern JCL for logical tests."}
                    ]
                },
                {
                    "id": "m9-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main difference between a cataloged procedure and an ''In-stream'' procedure?",
                    "answers": [
                        {"id": "m9-q3-a1", "text": "The cataloged procedure resides in an external PDS (Partitioned Data Set)", "isCorrect": true, "explanation": "Cataloged procedures are stored in procedure libraries (PROCLIB) so that they can be reused by several jobs."},
                        {"id": "m9-q3-a2", "text": "In-stream procedures cannot use parameters", "isCorrect": false},
                        {"id": "m9-q3-a3", "text": "The cataloged procedure is located in the JOB stream", "isCorrect": false},
                        {"id": "m9-q3-a4", "text": "There is no technical difference", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "Which statement must an ''In-stream'' procedure necessarily end with?",
                    "answers": [
                        {"id": "m9-q4-a1", "text": "// END", "isCorrect": false},
                        {"id": "m9-q4-a2", "text": "// FIN", "isCorrect": false},
                        {"id": "m9-q4-a3", "text": "// STOP", "isCorrect": false},
                        {"id": "m9-q4-a4", "text": "// PEND", "isCorrect": true, "explanation": "The PEND (Procedure End) statement marks the end of a procedure defined inside the job."}
                    ]
                },
                {
                    "id": "m9-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "What is a parameter defined by an ''&'' sign (e.g. &FILE) in a procedure called?",
                    "answers": [
                        {"id": "m9-q5-a1", "text": "A COBOL local variable", "isCorrect": false},
                        {"id": "m9-q5-a2", "text": "A DD pointer", "isCorrect": false},
                        {"id": "m9-q5-a3", "text": "A system parameter", "isCorrect": false},
                        {"id": "m9-q5-a4", "text": "A symbolic parameter", "isCorrect": true, "explanation": "Variables starting with ''&'' make procedures generic by substituting values when the procedure is called."}
                    ]
                },
                {
                    "id": "m9-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the JCL ''INCLUDE'' statement used for?",
                    "answers": [
                        {"id": "m9-q6-a1", "text": "To copy the COBOL source code into the JCL", "isCorrect": false},
                        {"id": "m9-q6-a2", "text": "To call a subprogram", "isCorrect": false},
                        {"id": "m9-q6-a3", "text": "To insert a group of JCL statements stored in an external member", "isCorrect": true, "explanation": "INCLUDE makes it possible to integrate reusable blocks of JCL (such as standard file definitions) without turning them into a procedure."},
                        {"id": "m9-q6-a4", "text": "To include load libraries (LOADLIB)", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main role of the IEFBR14 utility program?",
                    "answers": [
                        {"id": "m9-q7-a1", "text": "To compile a COBOL program", "isCorrect": false},
                        {"id": "m9-q7-a2", "text": "To allow files to be allocated or deleted through the DD statement", "isCorrect": true, "explanation": "Since it does nothing (it just returns control), it is used to carry out the disposition parameters (DISP) of the DD statements attached to it."},
                        {"id": "m9-q7-a3", "text": "To perform complex sorts", "isCorrect": false},
                        {"id": "m9-q7-a4", "text": "To copy files", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "Which of these utilities is the most appropriate for copying a simple sequential file or printing its content?",
                    "answers": [
                        {"id": "m9-q8-a1", "text": "IEBGENER", "isCorrect": true, "explanation": "IEBGENER is the standard and simple utility for copying sequential files or PDS members."},
                        {"id": "m9-q8-a2", "text": "IEFBR14", "isCorrect": false},
                        {"id": "m9-q8-a3", "text": "IDCAMS", "isCorrect": false},
                        {"id": "m9-q8-a4", "text": "IEBCOMPR", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q9",
                    "type": "SINGLE_CHOICE",
                    "text": "If you need to compare two files to check whether they are identical, which utility do you use?",
                    "answers": [
                        {"id": "m9-q9-a1", "text": "IEBCOMPR", "isCorrect": true, "explanation": "IEBCOMPR (Compare) is specifically designed to compare two sequential or PDS data sets."},
                        {"id": "m9-q9-a2", "text": "IDCAMS", "isCorrect": false},
                        {"id": "m9-q9-a3", "text": "SORT", "isCorrect": false},
                        {"id": "m9-q9-a4", "text": "IEBGENER", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q10",
                    "type": "SINGLE_CHOICE",
                    "text": "In the SORT utility, which control card defines the columns on which to sort?",
                    "answers": [
                        {"id": "m9-q10-a1", "text": "ORDER BY 1, 10", "isCorrect": false},
                        {"id": "m9-q10-a2", "text": "KEY=(1,10)", "isCorrect": false},
                        {"id": "m9-q10-a3", "text": "ARRANGE POS=1, LEN=10", "isCorrect": false},
                        {"id": "m9-q10-a4", "text": "SORT FIELDS=(1,10,CH,A)", "isCorrect": true, "explanation": "This syntax indicates to sort on 10 characters starting at position 1, in character format, in ascending order."}
                    ]
                },
                {
                    "id": "m9-q11",
                    "type": "SINGLE_CHOICE",
                    "text": "What is assigning a file to ''DUMMY'' in a DD statement used for?",
                    "answers": [
                        {"id": "m9-q11-a1", "text": "To create an empty test file", "isCorrect": false},
                        {"id": "m9-q11-a2", "text": "To hide the real name of the file for security reasons", "isCorrect": false},
                        {"id": "m9-q11-a3", "text": "To simulate an empty input file or to discard output writes", "isCorrect": true, "explanation": "A program that reads a DUMMY file immediately receives an end of file (EOF). If it writes to it, the data is ignored."},
                        {"id": "m9-q11-a4", "text": "To delete the file at the end of the step", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q12",
                    "type": "SINGLE_CHOICE",
                    "text": "How do you identify a temporary file in a DD statement?",
                    "answers": [
                        {"id": "m9-q12-a1", "text": "By not specifying any DSN at all", "isCorrect": false},
                        {"id": "m9-q12-a2", "text": "By a name starting with two ampersands (e.g. DSN=&&TEMP)", "isCorrect": true, "explanation": "Names starting with ''&&'' tell the system that the file is temporary and must be deleted at the end of the job."},
                        {"id": "m9-q12-a3", "text": "By using the UNIT=SYSDA parameter", "isCorrect": false},
                        {"id": "m9-q12-a4", "text": "By using DISP=(NEW,TEMP)", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q13",
                    "type": "SINGLE_CHOICE",
                    "text": "If a COBOL program ends with RC=12, and a following step has COND=(8,LT), will this step be executed?",
                    "answers": [
                        {"id": "m9-q13-a1", "text": "Yes, because 12 is greater than 8", "isCorrect": false},
                        {"id": "m9-q13-a2", "text": "No", "isCorrect": true, "explanation": "The COND test is an exclusion test: if the test is TRUE, the step is skipped (Bypass). Here 8 is less than 12, so the step is not executed."},
                        {"id": "m9-q13-a3", "text": "Only if the file is DUMMY", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q14",
                    "type": "SINGLE_CHOICE",
                    "text": "In a COBOL program, if the ''SELECT'' clause points to ''SYSUT1'', what must the corresponding DD statement in the JCL be named?",
                    "answers": [
                        {"id": "m9-q14-a1", "text": "//SYSUT1 DD ...", "isCorrect": true, "explanation": "The DDname in the JCL must exactly match the external name specified in the program''s SELECT ... ASSIGN TO clause."},
                        {"id": "m9-q14-a2", "text": "//PGM.SYSUT1 DD ...", "isCorrect": false},
                        {"id": "m9-q14-a3", "text": "//FILE1 DD ...", "isCorrect": false},
                        {"id": "m9-q14-a4", "text": "//SELECT SYSUT1 ...", "isCorrect": false}
                    ]
                },
                {
                    "id": "m9-q15",
                    "type": "SINGLE_CHOICE",
                    "text": "Which utility would you use to reorganize a file while eliminating duplicates?",
                    "answers": [
                        {"id": "m9-q15-a1", "text": "IEBGENER", "isCorrect": false},
                        {"id": "m9-q15-a2", "text": "SORT with the SUM FIELDS=NONE option", "isCorrect": true, "explanation": "The SUM FIELDS=NONE option in SORT keeps only one record per key, thus removing the duplicates."},
                        {"id": "m9-q15-a3", "text": "IEFBR14", "isCorrect": false},
                        {"id": "m9-q15-a4", "text": "IEBCOMPR", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;

-- ===== Module 10 - CICS Programming =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_lesson RECORD;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 10 - CICS Programming';
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, is_published, position)
        VALUES ('Module 10 - CICS Programming', true, (SELECT COALESCE(MAX(position), 0) + 1 FROM courses))
        RETURNING id INTO v_course_id;
    END IF;

    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - CICS Programming';
    IF v_chapter_id IS NULL THEN
        INSERT INTO chapters (title, position, course_id, is_published)
        VALUES ('Chapter 1 - CICS Programming', 1, v_course_id, true)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['What is CICS?', 'Key Concepts', 'Login & Logout', 'How to use the terminal?', 'Mapset & Map', 'Hello Map', 'How to code a CICS program?', 'The COMMAREA', 'The Execute Interface Block', 'How to use Maps with Cobol?', '🔨 Exercise: Work with Maps', 'How to work with the Commarea?', 'How to call other CICS programs?', 'More on Map Attributes', '🔨 Exercise: Sum', 'How to use DB2 with CICS?'],
            ARRAY['https://vimeo.com/1114694592?share=copy', 'https://vimeo.com/1114694606?share=copy', 'https://vimeo.com/1114694619?share=copy', 'https://vimeo.com/1114694638?share=copy', 'https://vimeo.com/1114694648?share=copy', 'https://vimeo.com/1114694665?share=copy', 'https://vimeo.com/1114694677?share=copy', 'https://vimeo.com/1114694698?share=copy', 'https://vimeo.com/1114694715?share=copy', 'https://vimeo.com/1114694726?share=copy', 'https://vimeo.com/1114694745?share=copy', 'https://vimeo.com/1114694759?share=copy', 'https://vimeo.com/1114694772?share=copy', 'https://vimeo.com/1114694786?share=copy', 'https://vimeo.com/1114694805?share=copy', 'https://vimeo.com/1114694821?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id, is_published)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id,
                true
            );
        END IF;
    END LOOP;
END $$;

-- ===== Module 10 - CICS Programming : Quiz (dernière leçon) =====
DO $$
DECLARE
    v_course_id UUID;
    v_chapter_id UUID;
    v_position INTEGER;
BEGIN
    SELECT id INTO v_course_id FROM courses WHERE title = 'Module 10 - CICS Programming';
    SELECT id INTO v_chapter_id FROM chapters WHERE course_id = v_course_id AND title = 'Chapter 1 - CICS Programming';

    IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = 'Quiz') THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO v_position FROM lessons WHERE chapter_id = v_chapter_id;

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate, is_published)
        VALUES (
            'Quiz',
            'QUIZ',
            v_position,
            v_chapter_id,
            '[
                {
                    "id": "m10-q1",
                    "type": "SINGLE_CHOICE",
                    "text": "What does the acronym CICS stand for?",
                    "answers": [
                        {"id": "m10-q1-a1", "text": "Customer Interface Control System", "isCorrect": false},
                        {"id": "m10-q1-a2", "text": "Computer Information Command Subsystem", "isCorrect": false},
                        {"id": "m10-q1-a3", "text": "Customer Information Control System", "isCorrect": true, "explanation": "CICS is an IBM transaction monitor, historically named this way for its role in processing customer information."},
                        {"id": "m10-q1-a4", "text": "Common Interface for Computer Systems", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q2",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main difference between a transaction and a task in CICS?",
                    "answers": [
                        {"id": "m10-q2-a1", "text": "A task is defined in the PCT, and a transaction in the PPT.", "isCorrect": false},
                        {"id": "m10-q2-a2", "text": "There is no difference, the two terms are strictly synonymous.", "isCorrect": false},
                        {"id": "m10-q2-a3", "text": "A task corresponds to the COBOL source code, and the transaction corresponds to the load module.", "isCorrect": false},
                        {"id": "m10-q2-a4", "text": "A transaction is an identifier defining the program to execute, whereas a task is the specific execution of that transaction.", "isCorrect": true}
                    ]
                },
                {
                    "id": "m10-q3",
                    "type": "SINGLE_CHOICE",
                    "text": "When creating screens with BMS, which macro is used to define the start of a Mapset?",
                    "answers": [
                        {"id": "m10-q3-a1", "text": "DFHMDF", "isCorrect": false},
                        {"id": "m10-q3-a2", "text": "DFHMSD", "isCorrect": true, "explanation": "DFHMSD (Map Set Definition) defines the start and the end of the Mapset."},
                        {"id": "m10-q3-a3", "text": "DFHMAP", "isCorrect": false},
                        {"id": "m10-q3-a4", "text": "DFHMDI", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q4",
                    "type": "SINGLE_CHOICE",
                    "text": "Which BMS macro is used to define a specific field, such as a label or an input area, on a screen?",
                    "answers": [
                        {"id": "m10-q4-a1", "text": "DFHMDF", "isCorrect": true, "explanation": "DFHMDF (Map Definition Field) is used to declare each field of the screen."},
                        {"id": "m10-q4-a2", "text": "DFHMDI", "isCorrect": false},
                        {"id": "m10-q4-a3", "text": "DFHMSD", "isCorrect": false},
                        {"id": "m10-q4-a4", "text": "DFHFLD", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q5",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the main role of the COMMAREA in a CICS program?",
                    "answers": [
                        {"id": "m10-q5-a1", "text": "To allow data and context to be passed between different programs or transactions.", "isCorrect": true, "explanation": "The COMMAREA (Communication Area) is used to pass information (parameters, state) from one program to another."},
                        {"id": "m10-q5-a2", "text": "To hold the source code of the main program for execution.", "isCorrect": false},
                        {"id": "m10-q5-a3", "text": "To store the screen definitions for the BMS display.", "isCorrect": false},
                        {"id": "m10-q5-a4", "text": "To manage the secure connection to the DB2 database.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q6",
                    "type": "SINGLE_CHOICE",
                    "text": "What does the Execute Interface Block (EIB) contain?",
                    "answers": [
                        {"id": "m10-q6-a1", "text": "Read-only system information (such as the date, the time, the terminal ID and the transaction ID).", "isCorrect": true, "explanation": "The EIB allows the COBOL program to know the CICS environment in which it is running."},
                        {"id": "m10-q6-a2", "text": "The local variables defined in the program''s WORKING-STORAGE.", "isCorrect": false},
                        {"id": "m10-q6-a3", "text": "The dynamic SQL queries to execute on DB2.", "isCorrect": false},
                        {"id": "m10-q6-a4", "text": "The data entered by the user on the 3270 terminal.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q7",
                    "type": "SINGLE_CHOICE",
                    "text": "Which specific EIB field indicates the size (length) of the COMMAREA passed to the current program?",
                    "answers": [
                        {"id": "m10-q7-a1", "text": "EIBDATE", "isCorrect": false},
                        {"id": "m10-q7-a2", "text": "EIBTASKN", "isCorrect": false},
                        {"id": "m10-q7-a3", "text": "EIBTRNID", "isCorrect": false},
                        {"id": "m10-q7-a4", "text": "EIBCALEN", "isCorrect": true, "explanation": "EIBCALEN (Communication Area Length) contains the length in bytes of the COMMAREA received."}
                    ]
                },
                {
                    "id": "m10-q8",
                    "type": "SINGLE_CHOICE",
                    "text": "Which CICS command is used in the COBOL program to display a screen (map) on the user''s terminal?",
                    "answers": [
                        {"id": "m10-q8-a1", "text": "EXEC CICS SEND MAP", "isCorrect": true},
                        {"id": "m10-q8-a2", "text": "EXEC CICS RECEIVE MAP", "isCorrect": false},
                        {"id": "m10-q8-a3", "text": "EXEC CICS WRITE TERMINAL", "isCorrect": false},
                        {"id": "m10-q8-a4", "text": "EXEC CICS DISPLAY SCREEN", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q9",
                    "type": "SINGLE_CHOICE",
                    "text": "When using the EXEC CICS RECEIVE MAP command, where does the data entered by the user end up in the COBOL program?",
                    "answers": [
                        {"id": "m10-q9-a1", "text": "In the DFHCOMMAREA.", "isCorrect": false},
                        {"id": "m10-q9-a2", "text": "In the symbolic map, usually included through a COPY in the program.", "isCorrect": true},
                        {"id": "m10-q9-a3", "text": "Directly in the corresponding DB2 tables.", "isCorrect": false},
                        {"id": "m10-q9-a4", "text": "In the EIB (Execute Interface Block).", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q10",
                    "type": "SINGLE_CHOICE",
                    "text": "What exactly happens when an EXEC CICS LINK command is executed?",
                    "answers": [
                        {"id": "m10-q10-a1", "text": "The program pauses and waits for input from the user on the terminal.", "isCorrect": false},
                        {"id": "m10-q10-a2", "text": "A new asynchronous task is created and runs in parallel with the calling program.", "isCorrect": false},
                        {"id": "m10-q10-a3", "text": "The calling program is removed from memory to make room for the new program.", "isCorrect": false},
                        {"id": "m10-q10-a4", "text": "Control passes to the called program, and once it has finished, it returns to the statement following the LINK in the calling program.", "isCorrect": true, "explanation": "LINK works like a subprogram call. The calling program waits for the called program (which is one logical level lower) to finish."}
                    ]
                },
                {
                    "id": "m10-q11",
                    "type": "SINGLE_CHOICE",
                    "text": "What is the major difference between EXEC CICS XCTL and EXEC CICS LINK?",
                    "answers": [
                        {"id": "m10-q11-a1", "text": "XCTL allows a COMMAREA to be passed, which is impossible with LINK.", "isCorrect": false},
                        {"id": "m10-q11-a2", "text": "There is no difference, they are synonyms for the same function.", "isCorrect": false},
                        {"id": "m10-q11-a3", "text": "LINK is used for web interfaces, whereas XCTL is for 3270 terminals.", "isCorrect": false},
                        {"id": "m10-q11-a4", "text": "With XCTL, control does not return to the original calling program once the called program has finished.", "isCorrect": true, "explanation": "XCTL ends the current program and permanently transfers control to the target program at the same logical level."}
                    ]
                },
                {
                    "id": "m10-q12",
                    "type": "SINGLE_CHOICE",
                    "text": "In a COBOL program, where must the structure that will receive the COMMAREA sent by another program (via LINK or XCTL) be declared?",
                    "answers": [
                        {"id": "m10-q12-a1", "text": "Directly in the EXECUTE INTERFACE BLOCK.", "isCorrect": false},
                        {"id": "m10-q12-a2", "text": "It does not need to be declared, CICS handles it invisibly.", "isCorrect": false},
                        {"id": "m10-q12-a3", "text": "Under the variable name DFHCOMMAREA in the LINKAGE SECTION.", "isCorrect": true},
                        {"id": "m10-q12-a4", "text": "Anywhere in the WORKING-STORAGE SECTION.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q13",
                    "type": "SINGLE_CHOICE",
                    "text": "How must a DB2 query be coded inside a COBOL-CICS program?",
                    "answers": [
                        {"id": "m10-q13-a1", "text": "EXEC SQL ... END-EXEC.", "isCorrect": true},
                        {"id": "m10-q13-a2", "text": "EXEC CICS SQL ... END-EXEC.", "isCorrect": false},
                        {"id": "m10-q13-a3", "text": "CALL ''DB2'' USING sql-query.", "isCorrect": false},
                        {"id": "m10-q13-a4", "text": "You just have to write them in SQL syntax directly in the PROCEDURE DIVISION.", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q14",
                    "type": "SINGLE_CHOICE",
                    "text": "When a program must test which function key (F1, F3, Enter, ...) the user pressed on a CICS screen, which field must it inspect?",
                    "answers": [
                        {"id": "m10-q14-a1", "text": "EIBAID", "isCorrect": true, "explanation": "EIBAID contains a code indicating the key that triggered the sending of the data."},
                        {"id": "m10-q14-a2", "text": "The DFHCOMMAREA", "isCorrect": false},
                        {"id": "m10-q14-a3", "text": "EIBCALEN", "isCorrect": false},
                        {"id": "m10-q14-a4", "text": "EIBTRNID", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q15",
                    "type": "SINGLE_CHOICE",
                    "text": "Which command is used to properly end the execution of a program and return control to the CICS system?",
                    "answers": [
                        {"id": "m10-q15-a1", "text": "EXEC CICS GOBACK", "isCorrect": false},
                        {"id": "m10-q15-a2", "text": "EXEC CICS RETURN", "isCorrect": true},
                        {"id": "m10-q15-a3", "text": "EXEC CICS EXIT", "isCorrect": false},
                        {"id": "m10-q15-a4", "text": "STOP RUN", "isCorrect": false}
                    ]
                },
                {
                    "id": "m10-q16",
                    "type": "SINGLE_CHOICE",
                    "text": "When compiling (assembling) BMS source code, which two elements are generated for the application?",
                    "answers": [
                        {"id": "m10-q16-a1", "text": "The executable COBOL program and the VSAM database.", "isCorrect": false},
                        {"id": "m10-q16-a2", "text": "The Physical Map and the Symbolic Map.", "isCorrect": true, "explanation": "The Physical Map is used by CICS to manage the display on the terminal, the Symbolic Map is the data dictionary (Copy) for the COBOL program."},
                        {"id": "m10-q16-a3", "text": "The DFHCOMMAREA and the EIB.", "isCorrect": false},
                        {"id": "m10-q16-a4", "text": "The DB2 Plan and the DBRM (Database Request Module).", "isCorrect": false}
                    ]
                }
            ]'::jsonb,
            70,
            true
        );
    END IF;
END $$;
