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
-- Cours non-gratuits (is_free = false, valeur par défaut) et publiés directement ;
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - Onboarding', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Introduction', 'Installing your environment'],
            ARRAY['https://vimeo.com/1118476860?share=copy', 'https://vimeo.com/1118476517?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - TSO & ISPF', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Login to TSO', 'Logout from TSO', 'Navigation', 'Overview of ISPF Menus', 'File System', 'How to Edit a File?'],
            ARRAY['https://vimeo.com/1114768902?share=copy', 'https://vimeo.com/1114768910?share=copy', 'https://vimeo.com/1114768916?share=copy', 'https://vimeo.com/1114768924?share=copy', 'https://vimeo.com/1114768930?share=copy', 'https://vimeo.com/1114768945?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
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

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate)
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
            70
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - Hello World', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Coding the program', 'Compilation', 'Running the program', 'Program''s Report in SDSF'],
            ARRAY['https://vimeo.com/1114768973?share=copy', 'https://vimeo.com/1114768985?share=copy', 'https://vimeo.com/1114768953?share=copy', 'https://vimeo.com/1114768961?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
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

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate)
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
            70
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - Cobol Basics', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Structure of a line of code', 'Program Structure', 'Identification Division', 'Adding Comments', 'Debugging the Compilation', 'How to Declare Variables?', 'Groups of Variables', 'DISPLAY Instruction', 'MOVE Instruction', 'How to Purge Jobs in SDSF', 'ACCEPT Instruction', 'FILLER', 'How to Initialize Variables?', 'ADD Instruction', 'SUBTRACT Instruction', 'MULTIPLY Instruction', 'DIVIDE Instruction', 'COMPUTE Instruction', 'IF Statement', 'EVALUATE Statement', 'Loops', 'The Period', 'Paragraphs', 'Sections', 'Condition Names'],
            ARRAY['https://vimeo.com/1114769004?share=copy', 'https://vimeo.com/1114769012?share=copy', 'https://vimeo.com/1114769017?share=copy', 'https://vimeo.com/1114769026?share=copy', 'https://vimeo.com/1114769032?share=copy', 'https://vimeo.com/1114769040?share=copy', 'https://vimeo.com/1114769045?share=copy', 'https://vimeo.com/1114769055?share=copy', 'https://vimeo.com/1114769061?share=copy', 'https://vimeo.com/1114769077?share=copy', 'https://vimeo.com/1114769081?share=copy', 'https://vimeo.com/1114769087?share=copy', 'https://vimeo.com/1114769098?share=copy', 'https://vimeo.com/1114769107?share=copy', 'https://vimeo.com/1114769115?share=copy', 'https://vimeo.com/1114769124?share=copy', 'https://vimeo.com/1114769133?share=copy', 'https://vimeo.com/1114769142?share=copy', 'https://vimeo.com/1114769149?share=copy', 'https://vimeo.com/1114769171?share=copy', 'https://vimeo.com/1114769186?share=copy', 'https://vimeo.com/1114769196?share=copy', 'https://vimeo.com/1114769208?share=copy', 'https://vimeo.com/1114769217?share=copy', 'https://vimeo.com/1114769226?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
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

        INSERT INTO lessons (title, type, position, chapter_id, quiz_questions, quiz_pass_rate)
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
            70
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - JCL Basics', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Definitions', 'How to code an instruction?', 'JOB Statement', 'EXEC Statement', 'JOBLIB and STEPLIB', 'Return Code and MAXCC'],
            ARRAY['https://vimeo.com/1114769338?share=copy', 'https://vimeo.com/1114769368?share=copy', 'https://vimeo.com/1114769405?share=copy', 'https://vimeo.com/1114769487?share=copy', 'https://vimeo.com/1114769235?share=copy', 'https://vimeo.com/1114769293?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
            );
        END IF;
    END LOOP;
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - Files and Libraries', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['File types', 'How to create a sequential file?', 'How to create a PDS?', 'Naming Convention', 'The Catalog', 'How to declare a file in a program?', 'File Description', 'OPEN & CLOSE', 'File Status', 'How to read a file?', 'DD Statement', 'How to write into a file?', 'Instream dataset', 'SYSIN', 'SYSOUT'],
            ARRAY['https://vimeo.com/1114769601?share=copy', 'https://vimeo.com/1114769633?share=copy', 'https://vimeo.com/1114769718?share=copy', 'https://vimeo.com/1114769767?share=copy', 'https://vimeo.com/1114769795?share=copy', 'https://vimeo.com/1114769849?share=copy', 'https://vimeo.com/1114769906?share=copy', 'https://vimeo.com/1114769948?share=copy', 'https://vimeo.com/1114769975?share=copy', 'https://vimeo.com/1114770023?share=copy', 'https://vimeo.com/1114770122?share=copy', 'https://vimeo.com/1114770236?share=copy', 'https://vimeo.com/1114770478?share=copy', 'https://vimeo.com/1114769519?share=copy', 'https://vimeo.com/1114769541?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
            );
        END IF;
    END LOOP;
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - Cobol – Advanced Concepts', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['Reference Modification', 'STRING Statement', 'UNSTRING Statement', 'INSPECT Statement', 'Signed Numbers', 'Decimal Numbers', 'Edited Numbers', 'COMP data types', 'Redefines', 'Work with Tables', 'Table index', 'SEARCH Statement', '🔨 Exercise: Work with tables', 'Work with Multi-Level Tables', 'COPY', 'Subprograms', 'Functions', '🔨 Exercise: Subprograms and Functions', 'How to debug a program?'],
            ARRAY['https://vimeo.com/1110667927?share=copy', 'https://vimeo.com/1110667932?share=copy', 'https://vimeo.com/1110667942?share=copy', 'https://vimeo.com/1110667951?share=copy', 'https://vimeo.com/1110667955?share=copy', 'https://vimeo.com/1110667960?share=copy', 'https://vimeo.com/1110667965?share=copy', 'https://vimeo.com/1110667972?share=copy', 'https://vimeo.com/1110667981?share=copy', 'https://vimeo.com/1110667996?share=copy', 'https://vimeo.com/1110668006?share=copy', 'https://vimeo.com/1110668014?share=copy', 'https://vimeo.com/1110668022?share=copy', 'https://vimeo.com/1110668025?share=copy', 'https://vimeo.com/1110668042?share=copy', 'https://vimeo.com/1110668054?share=copy', 'https://vimeo.com/1110668064?share=copy', 'https://vimeo.com/1110668073?share=copy', 'https://vimeo.com/1110668080?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
            );
        END IF;
    END LOOP;
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - DB2 with Cobol', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['DB2 – A Relational Database', 'Data Types', 'SQL Essentials', 'SPUFI', 'How to use SQL in a Cobol Program?', 'SQL in Cobol Program in Practice', 'DCLGEN', 'CURSOR', '🔨 Exercise: A program using a cursor', 'Work with VARCHAR', 'How to handle NULL?', '🔨 Project New Order – Presentation', '🔨 Project New Order – Table and File Creation', '🔨 Project New Order – The COBORDER Program', '🔨 Project New Order – Compilation and Run', 'DSNTIAR'],
            ARRAY['https://vimeo.com/1110512886?share=copy', 'https://vimeo.com/1110512897?share=copy', 'https://vimeo.com/1110512909?share=copy', 'https://vimeo.com/1110512919?share=copy', 'https://vimeo.com/1110512942?share=copy', 'https://vimeo.com/1110512955?share=copy', 'https://vimeo.com/1110512990?share=copy', 'https://vimeo.com/1110513008?share=copy', 'https://vimeo.com/1110513025?share=copy', 'https://vimeo.com/1110513061?share=copy', 'https://vimeo.com/1110513091?share=copy', 'https://vimeo.com/1110513119?share=copy', 'https://vimeo.com/1110513126?share=copy', 'https://vimeo.com/1110513148?share=copy', 'https://vimeo.com/1110512843?share=copy', 'https://vimeo.com/1110512859?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
            );
        END IF;
    END LOOP;
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - JCL – Advanced Concepts', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['COND Parameter', 'IF Statement', 'Abend', 'How to code Procedures?', 'Symbolic Parameters', 'INCLUDE', 'DUMMY', 'IEFBR14', 'IEBGENER', 'IEBCOMPR', 'IDCAMS', '🔨 Exercise: Utility programs', 'The SORT Program', 'Temporary Datasets'],
            ARRAY['https://vimeo.com/1114694315?share=copy', 'https://vimeo.com/1114694427?share=copy', 'https://vimeo.com/1114694436?share=copy', 'https://vimeo.com/1114694449?share=copy', 'https://vimeo.com/1114694456?share=copy', 'https://vimeo.com/1114694468?share=copy', 'https://vimeo.com/1114694475?share=copy', 'https://vimeo.com/1114694490?share=copy', 'https://vimeo.com/1114694508?share=copy', 'https://vimeo.com/1114694520?share=copy', 'https://vimeo.com/1114694531?share=copy', 'https://vimeo.com/1114694546?share=copy', 'https://vimeo.com/1114694559?share=copy', 'https://vimeo.com/1114694578?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
            );
        END IF;
    END LOOP;
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
        INSERT INTO chapters (title, position, course_id)
        VALUES ('Chapter 1 - CICS Programming', 1, v_course_id)
        RETURNING id INTO v_chapter_id;
    END IF;

    FOR v_lesson IN
        SELECT * FROM unnest(
            ARRAY['What is CICS?', 'Key Concepts', 'Login & Logout', 'How to use the terminal?', 'Mapset & Map', 'Hello Map', 'How to code a CICS program?', 'The COMMAREA', 'The Execute Interface Block', 'How to use Maps with Cobol?', '🔨 Exercise: Work with Maps', 'How to work with the Commarea?', 'How to call other CICS programs?', 'More on Map Attributes', '🔨 Exercise: Sum', 'How to use DB2 with CICS?'],
            ARRAY['https://vimeo.com/1114694592?share=copy', 'https://vimeo.com/1114694606?share=copy', 'https://vimeo.com/1114694619?share=copy', 'https://vimeo.com/1114694638?share=copy', 'https://vimeo.com/1114694648?share=copy', 'https://vimeo.com/1114694665?share=copy', 'https://vimeo.com/1114694677?share=copy', 'https://vimeo.com/1114694698?share=copy', 'https://vimeo.com/1114694715?share=copy', 'https://vimeo.com/1114694726?share=copy', 'https://vimeo.com/1114694745?share=copy', 'https://vimeo.com/1114694759?share=copy', 'https://vimeo.com/1114694772?share=copy', 'https://vimeo.com/1114694786?share=copy', 'https://vimeo.com/1114694805?share=copy', 'https://vimeo.com/1114694821?share=copy']
        ) WITH ORDINALITY AS t(title, url, pos)
    LOOP
        IF NOT EXISTS (SELECT 1 FROM lessons WHERE chapter_id = v_chapter_id AND title = v_lesson.title) THEN
            INSERT INTO lessons (title, content_blocks, position, type, chapter_id)
            VALUES (
                v_lesson.title,
                jsonb_build_array(jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'type', 'video',
                    'data', jsonb_build_object('url', v_lesson.url)
                )),
                v_lesson.pos,
                'VIDEO',
                v_chapter_id
            );
        END IF;
    END LOOP;
END $$;
