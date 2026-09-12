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
-- toutes les leçons sont de type VIDEO. Positions 1-based (cours, chapitres, leçons).
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
        END IF;
    END LOOP;
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
        END IF;
    END LOOP;
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
        END IF;
    END LOOP;
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
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
            INSERT INTO lessons (title, vimeo_url, position, type, chapter_id)
            VALUES (v_lesson.title, v_lesson.url, v_lesson.pos, 'VIDEO', v_chapter_id);
        END IF;
    END LOOP;
END $$;
