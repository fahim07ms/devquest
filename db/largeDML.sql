-- ============================================================
-- DevQuest Seed Data
-- Run this after your DDL. All UUIDs are hardcoded so foreign
-- keys resolve correctly across inserts.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. USERS  (20 users)
-- ============================================================
INSERT INTO "user" (user_id, username, email, password_hash, role, is_active, reputation_points) VALUES
                                                                                                     ('a1000000-0000-0000-0000-000000000001', 'alex_rivers',   'alex@devquest.io',    '$2b$10$placeholder_hash_1',  'member',    TRUE,  4820),
                                                                                                     ('a1000000-0000-0000-0000-000000000002', 'sofia_mendes',  'sofia@devquest.io',   '$2b$10$placeholder_hash_2',  'member',    TRUE,  3310),
                                                                                                     ('a1000000-0000-0000-0000-000000000003', 'kai_tanaka',    'kai@devquest.io',     '$2b$10$placeholder_hash_3',  'member',    TRUE,  7640),
                                                                                                     ('a1000000-0000-0000-0000-000000000004', 'priya_nair',    'priya@devquest.io',   '$2b$10$placeholder_hash_4',  'member',    TRUE,  2190),
                                                                                                     ('a1000000-0000-0000-0000-000000000005', 'luca_ferrari',  'luca@devquest.io',    '$2b$10$placeholder_hash_5',  'member',    TRUE,  5500),
                                                                                                     ('a1000000-0000-0000-0000-000000000006', 'omar_hassan',   'omar@devquest.io',    '$2b$10$placeholder_hash_6',  'moderator', TRUE,  9120),
                                                                                                     ('a1000000-0000-0000-0000-000000000007', 'emma_larsson',  'emma@devquest.io',    '$2b$10$placeholder_hash_7',  'member',    TRUE,  1870),
                                                                                                     ('a1000000-0000-0000-0000-000000000008', 'jin_park',      'jin@devquest.io',     '$2b$10$placeholder_hash_8',  'member',    TRUE,  6230),
                                                                                                     ('a1000000-0000-0000-0000-000000000009', 'fatima_ali',    'fatima@devquest.io',  '$2b$10$placeholder_hash_9',  'member',    TRUE,  3050),
                                                                                                     ('a1000000-0000-0000-0000-000000000010', 'noah_schulz',   'noah@devquest.io',    '$2b$10$placeholder_hash_10', 'member',    TRUE,  4410),
                                                                                                     ('a1000000-0000-0000-0000-000000000011', 'ines_costa',    'ines@devquest.io',    '$2b$10$placeholder_hash_11', 'member',    TRUE,  980),
                                                                                                     ('a1000000-0000-0000-0000-000000000012', 'ryan_okafor',   'ryan@devquest.io',    '$2b$10$placeholder_hash_12', 'member',    TRUE,  2760),
                                                                                                     ('a1000000-0000-0000-0000-000000000013', 'mei_zhang',     'mei@devquest.io',     '$2b$10$placeholder_hash_13', 'member',    TRUE,  8340),
                                                                                                     ('a1000000-0000-0000-0000-000000000014', 'david_kim',     'david@devquest.io',   '$2b$10$placeholder_hash_14', 'member',    TRUE,  1540),
                                                                                                     ('a1000000-0000-0000-0000-000000000015', 'sara_johansson','sara@devquest.io',    '$2b$10$placeholder_hash_15', 'member',    TRUE,  3890),
                                                                                                     ('a1000000-0000-0000-0000-000000000016', 'tom_nguyen',    'tom@devquest.io',     '$2b$10$placeholder_hash_16', 'member',    TRUE,  5120),
                                                                                                     ('a1000000-0000-0000-0000-000000000017', 'amara_diallo',  'amara@devquest.io',   '$2b$10$placeholder_hash_17', 'member',    TRUE,  2300),
                                                                                                     ('a1000000-0000-0000-0000-000000000018', 'ben_white',     'ben@devquest.io',     '$2b$10$placeholder_hash_18', 'member',    TRUE,  670),
                                                                                                     ('a1000000-0000-0000-0000-000000000019', 'nadia_petrov',  'nadia@devquest.io',   '$2b$10$placeholder_hash_19', 'member',    TRUE,  4090),
                                                                                                     ('a1000000-0000-0000-0000-000000000020', 'carlos_vega',   'carlos@devquest.io',  '$2b$10$placeholder_hash_20', 'admin',     TRUE,  11200);

-- ============================================================
-- 2. PROFILES
-- ============================================================
INSERT INTO "profile" (user_id, first_name, last_name, bio) VALUES
                                                                ('a1000000-0000-0000-0000-000000000001', 'Alex',    'Rivers',    'Full-stack developer. Loves TypeScript and clean APIs.'),
                                                                ('a1000000-0000-0000-0000-000000000002', 'Sofia',   'Mendes',    'Frontend engineer. React, accessibility, and design systems.'),
                                                                ('a1000000-0000-0000-0000-000000000003', 'Kai',     'Tanaka',    'Backend engineer specialising in distributed systems and Go.'),
                                                                ('a1000000-0000-0000-0000-000000000004', 'Priya',   'Nair',      'Data engineer. Python, Spark, and all things pipelines.'),
                                                                ('a1000000-0000-0000-0000-000000000005', 'Luca',    'Ferrari',   'DevOps and platform engineering. Kubernetes enthusiast.'),
                                                                ('a1000000-0000-0000-0000-000000000006', 'Omar',    'Hassan',    'Senior engineer and community moderator. Security-focused.'),
                                                                ('a1000000-0000-0000-0000-000000000007', 'Emma',    'Larsson',   'Junior dev learning React and Next.js. Asks good questions.'),
                                                                ('a1000000-0000-0000-0000-000000000008', 'Jin',     'Park',      'Systems programmer. Rust and C++ mostly.'),
                                                                ('a1000000-0000-0000-0000-000000000009', 'Fatima',  'Ali',       'Mobile developer. React Native and Swift.'),
                                                                ('a1000000-0000-0000-0000-000000000010', 'Noah',    'Schulz',    'Database administrator. PostgreSQL and query optimisation.'),
                                                                ('a1000000-0000-0000-0000-000000000011', 'Ines',    'Costa',     'Bootcamp grad. Working through the JavaScript ecosystem.'),
                                                                ('a1000000-0000-0000-0000-000000000012', 'Ryan',    'Okafor',    'Backend developer. Node.js, Express, and REST APIs.'),
                                                                ('a1000000-0000-0000-0000-000000000013', 'Mei',     'Zhang',     'Machine learning engineer. PyTorch and transformers.'),
                                                                ('a1000000-0000-0000-0000-000000000014', 'David',   'Kim',       'Student. Learning algorithms and data structures.'),
                                                                ('a1000000-0000-0000-0000-000000000015', 'Sara',    'Johansson', 'Web developer. Interested in performance and web standards.'),
                                                                ('a1000000-0000-0000-0000-000000000016', 'Tom',     'Nguyen',    'Cloud architect. AWS and Terraform.'),
                                                                ('a1000000-0000-0000-0000-000000000017', 'Amara',   'Diallo',    'Open source contributor. Linux and shell scripting.'),
                                                                ('a1000000-0000-0000-0000-000000000018', 'Ben',     'White',     'Self-taught developer. Building side projects.'),
                                                                ('a1000000-0000-0000-0000-000000000019', 'Nadia',   'Petrov',    'Security researcher. Penetration testing and CTFs.'),
                                                                ('a1000000-0000-0000-0000-000000000020', 'Carlos',  'Vega',      'Platform admin. 15 years in software engineering.');

-- ============================================================
-- 3. TAGS  (50 new tags — in addition to the 5 you already have)
-- ============================================================
INSERT INTO tag (name, description) VALUES
                                        ('nextjs',          'React framework with SSR, SSG, and App Router support.'),
                                        ('react',           'UI library for building component-based interfaces.'),
                                        ('typescript',      'Strongly-typed superset of JavaScript.'),
                                        ('nodejs',          'JavaScript runtime built on V8 for server-side code.'),
                                        ('express',         'Minimal Node.js web framework for building APIs.'),
                                        ('docker',          'Container platform for packaging and running applications.'),
                                        ('kubernetes',      'Container orchestration system for automated deployments.'),
                                        ('redis',           'In-memory data store used for caching and pub/sub.'),
                                        ('mongodb',         'Document-oriented NoSQL database.'),
                                        ('mysql',           'Popular open-source relational database.'),
                                        ('prisma',          'Type-safe ORM for Node.js and TypeScript.'),
                                        ('graphql',         'Query language and runtime for APIs.'),
                                        ('rest-api',        'Architectural style for HTTP-based APIs.'),
                                        ('jwt',             'JSON Web Tokens for stateless authentication.'),
                                        ('oauth',           'Open standard for delegated authorisation.'),
                                        ('websockets',      'Protocol for real-time bidirectional communication.'),
                                        ('rust',            'Systems language focused on safety and performance.'),
                                        ('go',              'Statically typed compiled language from Google.'),
                                        ('java',            'Object-oriented language running on the JVM.'),
                                        ('kotlin',          'Modern JVM language, fully interoperable with Java.'),
                                        ('swift',           'Language for building Apple platform applications.'),
                                        ('php',             'Server-side scripting language for the web.'),
                                        ('ruby',            'Dynamic language focused on simplicity and productivity.'),
                                        ('html',            'Standard markup language for web pages.'),
                                        ('css',             'Stylesheet language for describing document presentation.'),
                                        ('tailwindcss',     'Utility-first CSS framework.'),
                                        ('sql',             'Language for querying and managing relational data.'),
                                        ('git',             'Distributed version control system.'),
                                        ('linux',           'Open-source Unix-like operating system kernel.'),
                                        ('bash',            'Shell and scripting language for Unix systems.'),
                                        ('regex',           'Pattern-matching syntax for string operations.'),
                                        ('algorithms',      'Step-by-step procedures for solving computational problems.'),
                                        ('data-structures', 'Ways of organising data for efficient access and modification.'),
                                        ('debugging',       'Process of finding and fixing bugs in software.'),
                                        ('performance',     'Techniques for improving speed and resource usage.'),
                                        ('security',        'Practices for protecting systems from threats.'),
                                        ('testing',         'Evaluating software to verify correct behaviour.'),
                                        ('async',           'Patterns for non-blocking, concurrent code execution.'),
                                        ('concurrency',     'Handling multiple tasks making progress at the same time.'),
                                        ('memory-management','Controlling how programs allocate and free memory.'),
                                        ('aws',             'Amazon cloud computing platform and services.'),
                                        ('terraform',       'Infrastructure-as-code tool for cloud provisioning.'),
                                        ('ci-cd',           'Continuous integration and delivery practices.'),
                                        ('react-native',    'Framework for building cross-platform mobile apps with React.'),
                                        ('flutter',         'UI toolkit for building natively compiled mobile apps.'),
                                        ('pytorch',         'Machine learning framework from Meta.'),
                                        ('machine-learning','Field of AI focused on learning from data.'),
                                        ('vim',             'Modal text editor with a steep learning curve.'),
                                        ('nginx',           'High-performance web server and reverse proxy.'),
                                        ('webpack',         'Module bundler for JavaScript applications.')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. CONTENT + QUESTIONS  (60 questions)
-- ============================================================

-- Helper: content rows first, then question rows.
-- Format: q{nn}_c = content_id, q{nn} = question content_id (same value)

INSERT INTO content (content_id, content_type, author_id, body, vote_score, created_at) VALUES

-- Q01
('b1000000-0000-0000-0000-000000000001','question','a1000000-0000-0000-0000-000000000007',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I am building a Next.js 14 app using the App Router. When I navigate between pages the scroll position does not reset to the top. Users land in the middle of the new page. How do I fix this?"}]}]}',
 14, NOW() - INTERVAL '30 days'),

-- Q02
('b1000000-0000-0000-0000-000000000002','question','a1000000-0000-0000-0000-000000000011',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I keep seeing the error: Cannot read properties of undefined (reading ''map''). I have a state variable initialised to undefined and I call .map on it before the fetch resolves. What is the right pattern to handle this?"}]}]}',
 22, NOW() - INTERVAL '28 days'),

-- Q03
('b1000000-0000-0000-0000-000000000003','question','a1000000-0000-0000-0000-000000000004',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I have a Python script that reads a 10 GB CSV file into a pandas DataFrame. It immediately crashes with MemoryError. What are the correct approaches to process large files without loading everything into RAM?"}]}]}',
 31, NOW() - INTERVAL '25 days'),

-- Q04
('b1000000-0000-0000-0000-000000000004','question','a1000000-0000-0000-0000-000000000012',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL? I understand the concept vaguely but I always get confused when writing queries that involve multiple tables."}]}]}',
 45, NOW() - INTERVAL '22 days'),

-- Q05
('b1000000-0000-0000-0000-000000000005','question','a1000000-0000-0000-0000-000000000018',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I am trying to understand how async/await works under the hood in JavaScript. I know it is syntactic sugar over Promises but what is actually happening in the event loop when I use await?"}]}]}',
 38, NOW() - INTERVAL '20 days'),

-- Q06
('b1000000-0000-0000-0000-000000000006','question','a1000000-0000-0000-0000-000000000014',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the time and space complexity of the most common sorting algorithms? I am preparing for interviews and want a clear comparison of bubble sort, merge sort, quicksort, and heapsort."}]}]}',
 29, NOW() - INTERVAL '18 days'),

-- Q07
('b1000000-0000-0000-0000-000000000007','question','a1000000-0000-0000-0000-000000000002',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I have a React component that re-renders too often. I added React.memo but the component still re-renders every time the parent renders. What causes memo to not work and how do I debug unnecessary re-renders?"}]}]}',
 17, NOW() - INTERVAL '16 days'),

-- Q08
('b1000000-0000-0000-0000-000000000008','question','a1000000-0000-0000-0000-000000000017',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"How do I write a bash script that processes each line of a file and skips lines that start with a # character? I also want to trim leading whitespace before checking."}]}]}',
 11, NOW() - INTERVAL '15 days'),

-- Q09
('b1000000-0000-0000-0000-000000000009','question','a1000000-0000-0000-0000-000000000008',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"In Rust, what is the difference between String and &str? I come from a JavaScript background and the distinction between owned and borrowed strings is confusing to me."}]}]}',
 52, NOW() - INTERVAL '14 days'),

-- Q10
('b1000000-0000-0000-0000-000000000010','question','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I want to add JWT authentication to my Express API. Should I store the token in localStorage or in an httpOnly cookie? What are the security tradeoffs of each approach?"}]}]}',
 41, NOW() - INTERVAL '13 days'),

-- Q11
('b1000000-0000-0000-0000-000000000011','question','a1000000-0000-0000-0000-000000000009',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"My PostgreSQL query runs fast in development but is extremely slow in production with real data. EXPLAIN ANALYZE shows a sequential scan on a table with 2 million rows. How do I diagnose and fix this?"}]}]}',
 36, NOW() - INTERVAL '12 days'),

-- Q12
('b1000000-0000-0000-0000-000000000012','question','a1000000-0000-0000-0000-000000000015',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the difference between CSS Grid and Flexbox? I find myself reaching for Flexbox for everything. When should I prefer Grid, and are there cases where one cannot replace the other?"}]}]}',
 27, NOW() - INTERVAL '11 days'),

-- Q13
('b1000000-0000-0000-0000-000000000013','question','a1000000-0000-0000-0000-000000000005',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I have a Docker container that exits immediately after starting with exit code 1 but no visible error message. How do I debug a container that crashes on startup?"}]}]}',
 19, NOW() - INTERVAL '10 days'),

-- Q14
('b1000000-0000-0000-0000-000000000014','question','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I am designing a system that needs to handle 100k concurrent WebSocket connections. What architecture considerations should I keep in mind? Is a single Node.js process enough or do I need a message broker?"}]}]}',
 48, NOW() - INTERVAL '9 days'),

-- Q15
('b1000000-0000-0000-0000-000000000015','question','a1000000-0000-0000-0000-000000000013',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the difference between a transformer encoder and decoder? I am trying to understand BERT vs GPT architecturally, not just that one is bidirectional."}]}]}',
 33, NOW() - INTERVAL '8 days'),

-- Q16
('b1000000-0000-0000-0000-000000000016','question','a1000000-0000-0000-0000-000000000007',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"How do I properly type a generic fetch utility function in TypeScript so that the return type is inferred from the caller, not typed as any?"}]}]}',
 21, NOW() - INTERVAL '7 days'),

-- Q17
('b1000000-0000-0000-0000-000000000017','question','a1000000-0000-0000-0000-000000000011',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I am getting a CORS error when my React frontend calls my Express backend. Both run locally. I added cors() middleware but the error persists. What am I missing?"}]}]}',
 16, NOW() - INTERVAL '7 days'),

-- Q18
('b1000000-0000-0000-0000-000000000018','question','a1000000-0000-0000-0000-000000000014',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the best way to implement a debounce function in JavaScript from scratch? I understand the concept but I always get confused about closures and the timer reference."}]}]}',
 24, NOW() - INTERVAL '6 days'),

-- Q19
('b1000000-0000-0000-0000-000000000019','question','a1000000-0000-0000-0000-000000000019',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What are the most common SQL injection vectors and how do I protect against them in a Node.js application using raw queries? I understand parameterised queries in theory but want concrete examples."}]}]}',
 39, NOW() - INTERVAL '5 days'),

-- Q20
('b1000000-0000-0000-0000-000000000020','question','a1000000-0000-0000-0000-000000000012',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I need to implement pagination in my REST API. I have seen cursor-based and offset-based pagination. What are the tradeoffs and which should I use for a feed of user posts ordered by recency?"}]}]}',
 28, NOW() - INTERVAL '5 days'),

-- Q21
('b1000000-0000-0000-0000-000000000021','question','a1000000-0000-0000-0000-000000000004',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"How does Python''s GIL work and why does it matter for CPU-bound vs IO-bound concurrency? I want to understand when to use threading vs multiprocessing vs asyncio."}]}]}',
 35, NOW() - INTERVAL '4 days'),

-- Q22
('b1000000-0000-0000-0000-000000000022','question','a1000000-0000-0000-0000-000000000016',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the difference between Terraform state and the actual infrastructure? My state file says a resource exists but it was deleted manually in AWS. How do I reconcile this?"}]}]}',
 18, NOW() - INTERVAL '4 days'),

-- Q23
('b1000000-0000-0000-0000-000000000023','question','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I want to set up a CI/CD pipeline for a Next.js app deployed on Vercel. What should be in the pipeline — linting, tests, preview deployments? What does a good pipeline look like for a small team?"}]}]}',
 22, NOW() - INTERVAL '3 days'),

-- Q24
('b1000000-0000-0000-0000-000000000024','question','a1000000-0000-0000-0000-000000000010',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"My PostgreSQL table has grown to 50 million rows. Queries with WHERE created_at > $1 are slow even though I have an index on created_at. EXPLAIN shows the index is not being used. Why?"}]}]}',
 44, NOW() - INTERVAL '3 days'),

-- Q25
('b1000000-0000-0000-0000-000000000025','question','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the difference between authentication and authorisation? I always see these confused. Can you give a concrete example of a system that has both, and where each check happens?"}]}]}',
 57, NOW() - INTERVAL '2 days'),

-- Q26
('b1000000-0000-0000-0000-000000000026','question','a1000000-0000-0000-0000-000000000002',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I am migrating a class component to a functional component with hooks. The class has componentDidMount, componentDidUpdate, and componentWillUnmount. How do I map each lifecycle method to useEffect?"}]}]}',
 20, NOW() - INTERVAL '2 days'),

-- Q27
('b1000000-0000-0000-0000-000000000027','question','a1000000-0000-0000-0000-000000000018',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What is the difference between var, let, and const in JavaScript? I know const cannot be reassigned but I see people use it with objects and then mutate the properties. Is that allowed?"}]}]}',
 31, NOW() - INTERVAL '1 day'),

-- Q28
('b1000000-0000-0000-0000-000000000028','question','a1000000-0000-0000-0000-000000000015',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"How do I measure and improve Core Web Vitals for a Next.js application? My LCP is 4.2s and I have no idea where to start."}]}]}',
 15, NOW() - INTERVAL '20 hours'),

-- Q29
('b1000000-0000-0000-0000-000000000029','question','a1000000-0000-0000-0000-000000000008',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"In C++, what is the rule of five? I understand the rule of three but modern C++ with move semantics confuses me. When do I need to define all five special member functions?"}]}]}',
 26, NOW() - INTERVAL '18 hours'),

-- Q30
('b1000000-0000-0000-0000-000000000030','question','a1000000-0000-0000-0000-000000000009',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I am building a React Native app and the iOS build passes but Android crashes on startup with a native module error. The module is properly linked. What debugging steps should I take?"}]}]}',
 13, NOW() - INTERVAL '12 hours');

INSERT INTO "question" (content_id, title, view_count, answer_count, is_answered, last_activity_at) VALUES
                                                                                                        ('b1000000-0000-0000-0000-000000000001', 'Next.js App Router does not reset scroll position on navigation', 412, 2, TRUE,  NOW() - INTERVAL '28 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000002', 'Cannot read properties of undefined reading map — best pattern to avoid this?', 1820, 3, TRUE,  NOW() - INTERVAL '26 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000003', 'How to process a 10 GB CSV file in Python without MemoryError?', 2340, 2, TRUE,  NOW() - INTERVAL '23 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000004', 'What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?', 5100, 2, TRUE,  NOW() - INTERVAL '20 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000005', 'How does async/await work under the hood in JavaScript?', 3870, 2, TRUE,  NOW() - INTERVAL '18 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000006', 'Time and space complexity of common sorting algorithms', 4200, 2, TRUE,  NOW() - INTERVAL '16 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000007', 'React.memo not preventing re-renders — what am I missing?', 980, 2, TRUE,  NOW() - INTERVAL '14 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000008', 'Bash: skip comment lines and trim whitespace when reading a file', 760, 1, TRUE,  NOW() - INTERVAL '13 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000009', 'Rust: what is the difference between String and &str?', 6100, 2, TRUE,  NOW() - INTERVAL '12 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000010', 'JWT in localStorage vs httpOnly cookie — security tradeoffs', 7200, 2, TRUE,  NOW() - INTERVAL '11 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000011', 'PostgreSQL sequential scan on 2 million rows despite index', 3400, 2, TRUE,  NOW() - INTERVAL '10 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000012', 'CSS Grid vs Flexbox — when to use each?', 4800, 2, TRUE,  NOW() - INTERVAL '9 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000013', 'Docker container exits immediately with code 1 — how to debug?', 2200, 1, TRUE,  NOW() - INTERVAL '8 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000014', '100k concurrent WebSocket connections — architecture considerations', 5500, 2, TRUE,  NOW() - INTERVAL '7 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000015', 'Transformer encoder vs decoder — BERT vs GPT architecturally', 3100, 1, TRUE,  NOW() - INTERVAL '6 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000016', 'How to type a generic fetch utility in TypeScript so the return type is inferred?', 1400, 1, TRUE,  NOW() - INTERVAL '6 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000017', 'CORS error persists after adding cors() middleware in Express', 2800, 2, TRUE,  NOW() - INTERVAL '5 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000018', 'How to implement debounce from scratch in JavaScript?', 1900, 2, TRUE,  NOW() - INTERVAL '4 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000019', 'SQL injection vectors and how to prevent them in Node.js', 3300, 1, TRUE,  NOW() - INTERVAL '4 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000020', 'Cursor-based vs offset-based pagination — which to use for a feed?', 2600, 2, TRUE,  NOW() - INTERVAL '3 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000021', 'Python GIL — threading vs multiprocessing vs asyncio explained', 4100, 2, TRUE,  NOW() - INTERVAL '3 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000022', 'Terraform state out of sync with real infrastructure — how to reconcile?', 1700, 1, TRUE,  NOW() - INTERVAL '2 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000023', 'What should a CI/CD pipeline for a Next.js + Vercel project look like?', 1200, 1, TRUE,  NOW() - INTERVAL '2 days'),
                                                                                                        ('b1000000-0000-0000-0000-000000000024', 'PostgreSQL index on created_at not being used on 50M row table', 2900, 2, TRUE,  NOW() - INTERVAL '1 day'),
                                                                                                        ('b1000000-0000-0000-0000-000000000025', 'Authentication vs authorisation — what is the difference with a real example?', 8700, 2, TRUE,  NOW() - INTERVAL '1 day'),
                                                                                                        ('b1000000-0000-0000-0000-000000000026', 'Mapping React class lifecycle methods to useEffect hooks', 3500, 2, TRUE,  NOW() - INTERVAL '1 day'),
                                                                                                        ('b1000000-0000-0000-0000-000000000027', 'var vs let vs const — can you mutate object properties declared with const?', 5900, 2, TRUE,  NOW() - INTERVAL '20 hours'),
                                                                                                        ('b1000000-0000-0000-0000-000000000028', 'How to improve Core Web Vitals — LCP is 4.2s in Next.js app', 880, 1, FALSE, NOW() - INTERVAL '18 hours'),
                                                                                                        ('b1000000-0000-0000-0000-000000000029', 'C++ rule of five — when do I need all five special member functions?', 1500, 1, TRUE,  NOW() - INTERVAL '15 hours'),
                                                                                                        ('b1000000-0000-0000-0000-000000000030', 'React Native Android crash on startup — native module error', 640, 0, FALSE, NOW() - INTERVAL '12 hours');

-- ============================================================
-- 5. QUESTION TAGS
-- ============================================================
-- Map question UUIDs to tag names we inserted above
INSERT INTO question_tag (question_id, tag_id)
SELECT q.content_id, t.tag_id FROM (VALUES
                                        ('b1000000-0000-0000-0000-000000000001','nextjs'),
                                        ('b1000000-0000-0000-0000-000000000001','react'),
                                        ('b1000000-0000-0000-0000-000000000002','javascript'),
                                        ('b1000000-0000-0000-0000-000000000002','react'),
                                        ('b1000000-0000-0000-0000-000000000003','python'),
                                        ('b1000000-0000-0000-0000-000000000003','performance'),
                                        ('b1000000-0000-0000-0000-000000000004','sql'),
                                        ('b1000000-0000-0000-0000-000000000004','postgresql'),
                                        ('b1000000-0000-0000-0000-000000000005','javascript'),
                                        ('b1000000-0000-0000-0000-000000000005','async'),
                                        ('b1000000-0000-0000-0000-000000000006','algorithms'),
                                        ('b1000000-0000-0000-0000-000000000006','data-structures'),
                                        ('b1000000-0000-0000-0000-000000000007','react'),
                                        ('b1000000-0000-0000-0000-000000000007','performance'),
                                        ('b1000000-0000-0000-0000-000000000008','bash'),
                                        ('b1000000-0000-0000-0000-000000000008','linux'),
                                        ('b1000000-0000-0000-0000-000000000009','rust'),
                                        ('b1000000-0000-0000-0000-000000000010','security'),
                                        ('b1000000-0000-0000-0000-000000000010','jwt'),
                                        ('b1000000-0000-0000-0000-000000000010','nodejs'),
                                        ('b1000000-0000-0000-0000-000000000011','postgresql'),
                                        ('b1000000-0000-0000-0000-000000000011','performance'),
                                        ('b1000000-0000-0000-0000-000000000011','sql'),
                                        ('b1000000-0000-0000-0000-000000000012','css'),
                                        ('b1000000-0000-0000-0000-000000000012','html'),
                                        ('b1000000-0000-0000-0000-000000000013','docker'),
                                        ('b1000000-0000-0000-0000-000000000014','websockets'),
                                        ('b1000000-0000-0000-0000-000000000014','nodejs'),
                                        ('b1000000-0000-0000-0000-000000000014','concurrency'),
                                        ('b1000000-0000-0000-0000-000000000015','machine-learning'),
                                        ('b1000000-0000-0000-0000-000000000016','typescript'),
                                        ('b1000000-0000-0000-0000-000000000017','nodejs'),
                                        ('b1000000-0000-0000-0000-000000000017','express'),
                                        ('b1000000-0000-0000-0000-000000000017','rest-api'),
                                        ('b1000000-0000-0000-0000-000000000018','javascript'),
                                        ('b1000000-0000-0000-0000-000000000019','security'),
                                        ('b1000000-0000-0000-0000-000000000019','sql'),
                                        ('b1000000-0000-0000-0000-000000000019','nodejs'),
                                        ('b1000000-0000-0000-0000-000000000020','rest-api'),
                                        ('b1000000-0000-0000-0000-000000000020','postgresql'),
                                        ('b1000000-0000-0000-0000-000000000021','python'),
                                        ('b1000000-0000-0000-0000-000000000021','async'),
                                        ('b1000000-0000-0000-0000-000000000021','concurrency'),
                                        ('b1000000-0000-0000-0000-000000000022','terraform'),
                                        ('b1000000-0000-0000-0000-000000000022','aws'),
                                        ('b1000000-0000-0000-0000-000000000023','ci-cd'),
                                        ('b1000000-0000-0000-0000-000000000023','nextjs'),
                                        ('b1000000-0000-0000-0000-000000000024','postgresql'),
                                        ('b1000000-0000-0000-0000-000000000024','performance'),
                                        ('b1000000-0000-0000-0000-000000000025','security'),
                                        ('b1000000-0000-0000-0000-000000000026','react'),
                                        ('b1000000-0000-0000-0000-000000000027','javascript'),
                                        ('b1000000-0000-0000-0000-000000000028','nextjs'),
                                        ('b1000000-0000-0000-0000-000000000028','performance'),
                                        ('b1000000-0000-0000-0000-000000000029','c++'),
                                        ('b1000000-0000-0000-0000-000000000030','react-native')
                                   ) AS v(qid, tname)
                                       JOIN content q ON q.content_id = v.qid::uuid
                                       JOIN tag t ON t.name = v.tname
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. CONTENT + ANSWERS
-- ============================================================
INSERT INTO content (content_id, content_type, author_id, body, vote_score, created_at) VALUES

-- Answers for Q01 (scroll reset in Next.js)
('c1000000-0000-0000-0000-000000000001','answer','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Add a ScrollToTop component at the root layout level. In the App Router you can use a Client Component that calls window.scrollTo(0,0) inside a useEffect that depends on usePathname(). Wrap it in a Suspense boundary."}]},{"type":"codeBlock","attrs":{"language":"tsx"},"content":[{"type":"text","text":"''use client''\nimport { usePathname } from ''next/navigation''\nimport { useEffect } from ''react''\n\nexport function ScrollReset() {\n  const pathname = usePathname()\n  useEffect(() => { window.scrollTo(0, 0) }, [pathname])\n  return null\n}"}]}]}',
 9, NOW() - INTERVAL '28 days'),

('c1000000-0000-0000-0000-000000000002','answer','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"You can also use the built-in scroll restoration option. In next.config.js set experimental.scrollRestoration = false. The default behaviour in Next.js 13+ App Router actually does restore scroll on back/forward but resets on fresh navigations. If you are seeing it not reset, check whether you are navigating via a Link or programmatically via router.push — both should reset, but custom scroll containers bypass the browser scroll position entirely."}]}]}',
 4, NOW() - INTERVAL '27 days'),

-- Answers for Q02 (undefined map error)
('c1000000-0000-0000-0000-000000000003','answer','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Always initialise state to the same shape you expect after the fetch. If you will be mapping over an array, initialise to an empty array, not undefined or null."}]},{"type":"codeBlock","attrs":{"language":"tsx"},"content":[{"type":"text","text":"const [items, setItems] = useState<Item[]>([])\n// never undefined, .map will work immediately"}]}]}',
 18, NOW() - INTERVAL '27 days'),

('c1000000-0000-0000-0000-000000000004','answer','a1000000-0000-0000-0000-000000000010',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Another pattern is optional chaining. Call items?.map(...) and it returns undefined instead of throwing. Pair this with a loading guard so you render a skeleton while data is in flight. Using TypeScript will also catch this at compile time if you type the state correctly."}]}]}',
 7, NOW() - INTERVAL '26 days'),

('c1000000-0000-0000-0000-000000000005','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The canonical fix is initialise to [] as shown above. But the deeper issue is race conditions. If two fetches fire and the second resolves first, you will display stale data. Look into using an AbortController to cancel the previous request, or use a library like TanStack Query which handles this for you."}]}]}',
 12, NOW() - INTERVAL '25 days'),

-- Answers for Q03 (large CSV)
('c1000000-0000-0000-0000-000000000006','answer','a1000000-0000-0000-0000-000000000004',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Use pandas chunk reading. Pass chunksize to read_csv and process each chunk independently."}]},{"type":"codeBlock","attrs":{"language":"python"},"content":[{"type":"text","text":"for chunk in pd.read_csv(''file.csv'', chunksize=100_000):\n    process(chunk)"}]},{"type":"paragraph","content":[{"type":"text","text":"For more complex transformations consider Polars, which is lazy by default and never loads the full file, or DuckDB which can query CSVs using SQL directly."}]}]}',
 24, NOW() - INTERVAL '23 days'),

('c1000000-0000-0000-0000-000000000007','answer','a1000000-0000-0000-0000-000000000013',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"If you need a full dataset in memory for ML, consider converting the CSV to Parquet first. Parquet is columnar so a 10 GB CSV might become 1–2 GB, and you can read only the columns you need. Use pyarrow.dataset for even more control."}]}]}',
 9, NOW() - INTERVAL '22 days'),

-- Answers for Q04 (SQL joins)
('c1000000-0000-0000-0000-000000000008','answer','a1000000-0000-0000-0000-000000000010',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Think of it in terms of which rows survive. INNER JOIN keeps only rows with a match in both tables. LEFT JOIN keeps every row from the left table — if there is no match on the right, those columns are NULL. RIGHT JOIN is the mirror of LEFT. FULL OUTER JOIN keeps everything from both sides. In practice RIGHT JOIN is rarely used because you can always rewrite it as a LEFT JOIN by swapping the table order."}]}]}',
 38, NOW() - INTERVAL '20 days'),

('c1000000-0000-0000-0000-000000000009','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A good mental model: INNER JOIN is an intersection, LEFT JOIN is a left-biased union, FULL OUTER JOIN is a full union. Draw a Venn diagram with the two tables as circles. The type of join determines which region of the diagram you keep. The WHERE clause then filters that result further."}]}]}',
 15, NOW() - INTERVAL '19 days'),

-- Answers for Q05 (async/await)
('c1000000-0000-0000-0000-000000000010','answer','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"When you hit await, the function pauses and yields control back to the event loop. The runtime schedules the continuation as a microtask. When the awaited Promise resolves, the microtask queue processes it before the next macrotask (setTimeout, I/O). The key insight is that await does not block the thread — other code runs while the I/O is in flight."}]}]}',
 29, NOW() - INTERVAL '18 days'),

('c1000000-0000-0000-0000-000000000011','answer','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Concretely: async/await desugars to .then() chains. The V8 engine represents each await as a continuation. The Promise microtask queue is drained completely after each task completes, before the next task is dequeued. This is why Promise callbacks always run before setTimeout(fn, 0) callbacks even though both appear asynchronous."}]}]}',
 11, NOW() - INTERVAL '17 days'),

-- Answers for Q06 (sorting complexity)
('c1000000-0000-0000-0000-000000000012','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Bubble sort: O(n²) time always, O(1) space. Merge sort: O(n log n) always, O(n) space. Quicksort: O(n log n) average, O(n²) worst case with bad pivot, O(log n) space. Heapsort: O(n log n) always, O(1) space. For interviews: merge sort for guaranteed O(n log n) with stable ordering. Quicksort is fastest in practice due to cache locality. Heapsort if you need in-place O(n log n)."}]}]}',
 21, NOW() - INTERVAL '16 days'),

('c1000000-0000-0000-0000-000000000013','answer','a1000000-0000-0000-0000-000000000008',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"One addition: Timsort is what Python and Java actually use. It is a hybrid of merge sort and insertion sort, O(n log n) worst case, O(n) best case on nearly sorted input. Real-world data is rarely random so Timsort performs better in practice than any of the theoretical algorithms above."}]}]}',
 8, NOW() - INTERVAL '15 days'),

-- Answers for Q07 (React.memo)
('c1000000-0000-0000-0000-000000000014','answer','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"React.memo does a shallow comparison of props. If a parent passes a callback or object literal as a prop, it creates a new reference on every render, causing memo to always see changed props. Wrap callbacks with useCallback and objects with useMemo before passing them down."}]},{"type":"codeBlock","attrs":{"language":"tsx"},"content":[{"type":"text","text":"const handleClick = useCallback(() => doSomething(id), [id])\n// Now handleClick has a stable reference across renders"}]}]}',
 14, NOW() - INTERVAL '14 days'),

('c1000000-0000-0000-0000-000000000015','answer','a1000000-0000-0000-0000-000000000002',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Use the React DevTools Profiler to see which props are changing between renders. Enable ''Record why each component rendered'' in settings. It will tell you exactly which prop failed the memo comparison, which is much faster than guessing."}]}]}',
 6, NOW() - INTERVAL '13 days'),

-- Answer for Q08 (bash skip comments)
('c1000000-0000-0000-0000-000000000016','answer','a1000000-0000-0000-0000-000000000017',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Use a while read loop and combine parameter expansion for trimming with a glob match for the comment check."}]},{"type":"codeBlock","attrs":{"language":"bash"},"content":[{"type":"text","text":"while IFS= read -r line; do\n  trimmed=\"${line#\"${line%%[![:space:]]*}\"}\"\n  [[ \"$trimmed\" == \\#* ]] && continue\n  echo \"$trimmed\"\ndone < file.txt"}]}]}',
 9, NOW() - INTERVAL '13 days'),

-- Answers for Q09 (Rust String vs &str)
('c1000000-0000-0000-0000-000000000017','answer','a1000000-0000-0000-0000-000000000008',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"String is an owned, heap-allocated, growable UTF-8 buffer. &str is a borrowed reference to a UTF-8 string slice — it could point into a String, a string literal in the binary, or any contiguous UTF-8 bytes. Use &str in function parameters whenever you do not need ownership. Use String when you need to own or mutate the data."}]}]}',
 41, NOW() - INTERVAL '12 days'),

('c1000000-0000-0000-0000-000000000018','answer','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The JavaScript analogy: String is like a value you own in a Map. &str is like a const reference to a substring. The key difference Rust enforces is that if you give someone a &str, the owner of the underlying data must stay alive for at least as long as the reference — the borrow checker enforces this. JavaScript has no equivalent concept because the GC handles lifetimes."}]}]}',
 16, NOW() - INTERVAL '11 days'),

-- Answers for Q10 (JWT storage)
('c1000000-0000-0000-0000-000000000019','answer','a1000000-0000-0000-0000-000000000019',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Short answer: httpOnly cookie. localStorage is accessible via JavaScript, so any XSS vulnerability in your app leaks the token. httpOnly cookies cannot be read by JavaScript at all. You do need to protect against CSRF — use SameSite=Strict or SameSite=Lax and a CSRF token if you need cross-site requests."}]}]}',
 34, NOW() - INTERVAL '11 days'),

('c1000000-0000-0000-0000-000000000020','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"There is no universally correct answer — it depends on your threat model. If your biggest risk is XSS: use httpOnly cookies. If your biggest risk is CSRF and you have tight control over origins: localStorage plus short expiry plus refresh tokens is acceptable. For most web apps, httpOnly + SameSite cookie is the safer default."}]}]}',
 12, NOW() - INTERVAL '10 days'),

-- Answers for Q11 (PG slow query)
('c1000000-0000-0000-0000-000000000021','answer','a1000000-0000-0000-0000-000000000010',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Run EXPLAIN (ANALYZE, BUFFERS) — the BUFFERS option shows cache hit ratio which often reveals the real problem. Common causes: statistics are stale (run ANALYZE), the planner estimates very few rows matching the condition and decides a seq scan is cheaper, or your index is on the wrong column combination for the query shape."}]}]}',
 28, NOW() - INTERVAL '10 days'),

('c1000000-0000-0000-0000-000000000022','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Also check table bloat. If the table has had many deletes and updates, dead tuples can cause the index to be less selective than it appears. Run VACUUM ANALYZE and then re-check. For a 2M row table that was heavily updated, bloat is a common culprit that EXPLAIN ANALYZE does not surface directly."}]}]}',
 10, NOW() - INTERVAL '9 days'),

-- Answers for Q12 (Grid vs Flexbox)
('c1000000-0000-0000-0000-000000000023','answer','a1000000-0000-0000-0000-000000000002',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Flexbox is one-dimensional — it lays items along a single axis. Grid is two-dimensional — rows and columns at the same time. Use Flexbox for navigation bars, button groups, centring content inside a card. Use Grid for page layouts, card grids, anything where you need items to align across both axes simultaneously."}]}]}',
 22, NOW() - INTERVAL '9 days'),

('c1000000-0000-0000-0000-000000000024','answer','a1000000-0000-0000-0000-000000000015',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A practical rule: if you are thinking about the layout from the container''s perspective and placing children into it, use Grid. If you are thinking about how children flow relative to each other, use Flexbox. They compose well — use Grid for the outer page structure and Flexbox inside individual components."}]}]}',
 9, NOW() - INTERVAL '8 days'),

-- Answer for Q13 (Docker debug)
('c1000000-0000-0000-0000-000000000025','answer','a1000000-0000-0000-0000-000000000005',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Run docker logs <container_id> immediately after the crash. If the container is already gone use docker ps -a to find it. Then run docker run --entrypoint sh <image> -c ''your-start-command'' to enter a shell and run the entrypoint manually. Most silent crashes are missing environment variables, missing files the entrypoint expects, or permission errors on the working directory."}]}]}',
 16, NOW() - INTERVAL '8 days'),

-- Answers for Q14 (100k WebSocket)
('c1000000-0000-0000-0000-000000000026','answer','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A single Node.js process can handle 100k connections with the right tuning — increase the OS file descriptor limit (ulimit -n), use a high-performance WebSocket library like uWebSockets.js rather than ws, and disable Nagle''s algorithm. However for reliability you will want multiple processes behind a load balancer. The hard problem is broadcasting: if a message needs to reach all 100k connections, use Redis pub/sub so all nodes receive it."}]}]}',
 37, NOW() - INTERVAL '7 days'),

('c1000000-0000-0000-0000-000000000027','answer','a1000000-0000-0000-0000-000000000016',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"At that scale you should also think about the memory profile. Each WebSocket connection in Node.js holds around 50–100 KB of buffer space. 100k connections is 5–10 GB of RAM just for buffers. Consider whether your use case truly needs persistent connections or whether Server-Sent Events (one-directional, lower overhead) would work."}]}]}',
 14, NOW() - INTERVAL '6 days'),

-- Answer for Q15 (transformer encoder vs decoder)
('c1000000-0000-0000-0000-000000000028','answer','a1000000-0000-0000-0000-000000000013',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The encoder uses bidirectional self-attention — each token can attend to every other token in the sequence. BERT is encoder-only. This makes it excellent at understanding tasks (classification, NER, QA) because it sees the full context. The decoder uses masked self-attention — each token can only attend to previous tokens. GPT is decoder-only. This makes it excellent at generation because it predicts the next token autoregressively. Encoder-decoder models like T5 use both: encoder reads input, decoder generates output."}]}]}',
 27, NOW() - INTERVAL '6 days'),

-- Answer for Q16 (TypeScript generic fetch)
('c1000000-0000-0000-0000-000000000029','answer','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Use a generic type parameter on the function and pass it at the call site."}]},{"type":"codeBlock","attrs":{"language":"typescript"},"content":[{"type":"text","text":"async function fetchJson<T>(url: string): Promise<T> {\n  const res = await fetch(url)\n  if (!res.ok) throw new Error(res.statusText)\n  return res.json() as Promise<T>\n}\n\n// Caller provides the type:\nconst user = await fetchJson<User>(''/api/users/1'')"}]}]}',
 18, NOW() - INTERVAL '5 days'),

-- Answers for Q17 (CORS)
('c1000000-0000-0000-0000-000000000030','answer','a1000000-0000-0000-0000-000000000012',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The most common mistake is applying cors() after your routes, or only on some routes. Apply it as the first middleware before any routes."}]},{"type":"codeBlock","attrs":{"language":"javascript"},"content":[{"type":"text","text":"const app = express()\napp.use(cors({ origin: ''http://localhost:3000'', credentials: true }))\n// routes come AFTER"}]}]}',
 13, NOW() - INTERVAL '5 days'),

('c1000000-0000-0000-0000-000000000031','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Also check whether you are sending credentials (cookies, auth headers). If so, you cannot use origin: ''*'' — you must specify the exact origin and set credentials: true on both the CORS config and the fetch call (credentials: ''include''). The browser blocks wildcard origins when credentials are involved."}]}]}',
 8, NOW() - INTERVAL '4 days'),

-- Answers for Q18 (debounce)
('c1000000-0000-0000-0000-000000000032','answer','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The key is the closure over the timer variable."}]},{"type":"codeBlock","attrs":{"language":"javascript"},"content":[{"type":"text","text":"function debounce(fn, delay) {\n  let timer\n  return function(...args) {\n    clearTimeout(timer)\n    timer = setTimeout(() => fn.apply(this, args), delay)\n  }\n}"}]},{"type":"paragraph","content":[{"type":"text","text":"Each call to the returned function clears the previous timer and sets a new one. The original function only fires if no new call arrives within the delay window."}]}]}',
 19, NOW() - INTERVAL '4 days'),

('c1000000-0000-0000-0000-000000000033','answer','a1000000-0000-0000-0000-000000000015',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"For React, wrap it in useRef so the timer survives re-renders without causing them, and wrap it in useCallback."}]},{"type":"codeBlock","attrs":{"language":"tsx"},"content":[{"type":"text","text":"const timerRef = useRef<ReturnType<typeof setTimeout>>()\nconst debouncedSearch = useCallback((q: string) => {\n  clearTimeout(timerRef.current)\n  timerRef.current = setTimeout(() => search(q), 300)\n}, [])"}]}]}',
 7, NOW() - INTERVAL '3 days'),

-- Answer for Q19 (SQL injection)
('c1000000-0000-0000-0000-000000000034','answer','a1000000-0000-0000-0000-000000000019',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Never interpolate user input into SQL strings. With pg (node-postgres) always use parameterised queries."}]},{"type":"codeBlock","attrs":{"language":"javascript"},"content":[{"type":"text","text":"// VULNERABLE\nawait pool.query(`SELECT * FROM users WHERE id = ${req.params.id}`)\n\n// SAFE\nawait pool.query(''SELECT * FROM users WHERE id = $1'', [req.params.id])"}]},{"type":"paragraph","content":[{"type":"text","text":"The driver sends the query and parameters separately. The database never interprets the parameter as SQL. Also watch for second-order injection: if you store user input in the DB and later use it to build another query."}]}]}',
 31, NOW() - INTERVAL '3 days'),

-- Answers for Q20 (pagination)
('c1000000-0000-0000-0000-000000000035','answer','a1000000-0000-0000-0000-000000000010',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"For a recency-ordered feed use cursor-based pagination. Offset pagination has two problems: it is slow at high offsets (the database still scans all preceding rows) and it produces inconsistent results if rows are inserted while a user is paging. Cursor-based uses a WHERE created_at < $cursor query which uses the index directly."}]}]}',
 24, NOW() - INTERVAL '2 days'),

('c1000000-0000-0000-0000-000000000036','answer','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Use offset pagination if you need to show page numbers (''Page 4 of 23'') or allow jumping to arbitrary pages. Use cursor pagination for infinite scroll feeds. For your use case — a recency-ordered post feed — cursor is almost certainly the right choice. Return the created_at of the last item as the cursor and pass it as a query parameter on the next request."}]}]}',
 11, NOW() - INTERVAL '2 days'),

-- Answers for Q21 (Python GIL)
('c1000000-0000-0000-0000-000000000037','answer','a1000000-0000-0000-0000-000000000004',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The GIL is a mutex that allows only one thread to execute Python bytecode at a time. For IO-bound work (network, disk) threads work fine because the GIL is released during IO calls. For CPU-bound work (computation), threads do not give you parallelism — use multiprocessing which spawns separate Python processes each with their own GIL. Asyncio is single-threaded event-loop concurrency — excellent for high-concurrency IO but not CPU work."}]}]}',
 27, NOW() - INTERVAL '2 days'),

('c1000000-0000-0000-0000-000000000038','answer','a1000000-0000-0000-0000-000000000013',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Quick decision tree: network requests or database calls → asyncio. Mixing sync and async code → threading (with care). Heavy number crunching in Python → multiprocessing. Heavy number crunching in numpy/PyTorch → those libraries release the GIL themselves so threading works fine for them."}]}]}',
 10, NOW() - INTERVAL '1 day'),

-- Answer for Q22 (Terraform state)
('c1000000-0000-0000-0000-000000000039','answer','a1000000-0000-0000-0000-000000000016',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Run terraform refresh to sync state with reality, then terraform plan to see the diff. If the resource was deleted and you want Terraform to stop managing it, run terraform state rm <resource_address>. If you want to recreate it, just run terraform apply — Terraform will detect it is missing and create it again."}]}]}',
 15, NOW() - INTERVAL '1 day'),

-- Answer for Q23 (CI/CD for Next.js)
('c1000000-0000-0000-0000-000000000040','answer','a1000000-0000-0000-0000-000000000005',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A solid pipeline for a small team: (1) lint with ESLint on every push, (2) type-check with tsc --noEmit, (3) run unit and integration tests, (4) Vercel preview deployment on every PR automatically (Vercel does this natively), (5) merge to main triggers production deployment. Skip building Docker images unless you have custom infra — let Vercel handle the build."}]}]}',
 19, NOW() - INTERVAL '20 hours'),

-- Answers for Q24 (index not used)
('c1000000-0000-0000-0000-000000000041','answer','a1000000-0000-0000-0000-000000000010',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"At 50M rows the planner might correctly determine that a bitmap index scan is slower than a seq scan if the query returns many rows. Check the actual row estimate in EXPLAIN ANALYZE. If it is wildly off, run ANALYZE to update statistics. You can also increase statistics target for that column: ALTER TABLE t ALTER COLUMN created_at SET STATISTICS 500."}]}]}',
 20, NOW() - INTERVAL '18 hours'),

('c1000000-0000-0000-0000-000000000042','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Also consider table partitioning by time range if most queries target a recent time window. A partition on (YEAR, MONTH) means the planner only scans the relevant partition, making the index on a 400k-row partition vastly more effective than on the full 50M-row table."}]}]}',
 9, NOW() - INTERVAL '15 hours'),

-- Answers for Q25 (authn vs authz)
('c1000000-0000-0000-0000-000000000043','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Authentication answers ''who are you?'' — it verifies identity. Authorisation answers ''what are you allowed to do?'' — it checks permissions. Example: in a GitHub repo, logging in with your username and password is authentication. Whether you can push to a protected branch is authorisation. They happen at different points: authentication at login/request entry, authorisation on each protected action."}]}]}',
 45, NOW() - INTERVAL '22 hours'),

('c1000000-0000-0000-0000-000000000044','answer','a1000000-0000-0000-0000-000000000019',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"JWT stores authentication claims. The middleware that validates the token is authentication. The middleware or service that checks whether the token''s user_id has a given role or permission is authorisation. Conflating them leads to bugs like checking ''is the user logged in?'' when you should be checking ''does this user own this resource?''."}]}]}',
 18, NOW() - INTERVAL '20 hours'),

-- Answers for Q26 (lifecycle to useEffect)
('c1000000-0000-0000-0000-000000000045','answer','a1000000-0000-0000-0000-000000000001',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"componentDidMount → useEffect with empty deps []. componentDidUpdate(prevProps) → useEffect with the relevant values in the deps array. componentWillUnmount → return a cleanup function from useEffect."}]},{"type":"codeBlock","attrs":{"language":"tsx"},"content":[{"type":"text","text":"useEffect(() => {\n  // componentDidMount + componentDidUpdate when id changes\n  fetchData(id)\n  return () => {\n    // componentWillUnmount\n    cleanup()\n  }\n}, [id])"}]}]}',
 17, NOW() - INTERVAL '20 hours'),

('c1000000-0000-0000-0000-000000000046','answer','a1000000-0000-0000-0000-000000000002',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"One subtlety: useEffect always runs after mount AND after every update where deps changed. There is no direct equivalent of ''only on update, skip on mount''. The workaround is a useRef flag that you set to true after the first render. This is rarely needed — usually redesigning the logic avoids it."}]}]}',
 7, NOW() - INTERVAL '18 hours'),

-- Answers for Q27 (var/let/const)
('c1000000-0000-0000-0000-000000000047','answer','a1000000-0000-0000-0000-000000000003',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"var is function-scoped and hoisted. let and const are block-scoped. const prevents reassignment of the binding — you cannot write const x = 1; x = 2. But const on an object means the reference cannot change, not the contents. object.property = ''new value'' is fine because you are mutating the object, not reassigning the variable."}]}]}',
 24, NOW() - INTERVAL '15 hours'),

('c1000000-0000-0000-0000-000000000048','answer','a1000000-0000-0000-0000-000000000006',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Practical rule: use const for everything, switch to let only when you need to reassign (loop counters, accumulator variables). Never use var. This is not just stylistic — const communicates intent to other developers and catches accidental reassignments at runtime."}]}]}',
 10, NOW() - INTERVAL '12 hours'),

-- Answer for Q28 (LCP)
('c1000000-0000-0000-0000-000000000049','answer','a1000000-0000-0000-0000-000000000015',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"4.2s LCP is almost always a large image or server response time. Check: is the LCP element an image? If so, make sure it has priority on the Image component, is served in WebP format, and is properly sized. Use next/image with sizes prop. If LCP is text, the likely culprit is a slow server response — check TTFB in the network tab and consider static generation (generateStaticParams) instead of server-side rendering for that page."}]}]}',
 12, NOW() - INTERVAL '10 hours'),

-- Answer for Q29 (C++ rule of five)
('c1000000-0000-0000-0000-000000000050','answer','a1000000-0000-0000-0000-000000000008',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The five are: destructor, copy constructor, copy assignment operator, move constructor, move assignment operator. You need all five when your class manages a raw resource (pointer, file handle, socket). If you define any one of them the compiler assumes you know what you are doing and stops generating the others. Move semantics let you transfer resource ownership instead of copying. If you only need value semantics, use RAII wrappers (unique_ptr, vector) and the compiler-generated defaults will be correct."}]}]}',
 21, NOW() - INTERVAL '10 hours');

INSERT INTO "answer" (content_id, question_id, is_accepted, accepted_at) VALUES
                                                                             ('c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001', TRUE,  NOW() - INTERVAL '27 days'),
                                                                             ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000001', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000002', TRUE,  NOW() - INTERVAL '26 days'),
                                                                             ('c1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000002', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000002', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000006','b1000000-0000-0000-0000-000000000003', TRUE,  NOW() - INTERVAL '22 days'),
                                                                             ('c1000000-0000-0000-0000-000000000007','b1000000-0000-0000-0000-000000000003', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000008','b1000000-0000-0000-0000-000000000004', TRUE,  NOW() - INTERVAL '19 days'),
                                                                             ('c1000000-0000-0000-0000-000000000009','b1000000-0000-0000-0000-000000000004', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000010','b1000000-0000-0000-0000-000000000005', TRUE,  NOW() - INTERVAL '17 days'),
                                                                             ('c1000000-0000-0000-0000-000000000011','b1000000-0000-0000-0000-000000000005', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000012','b1000000-0000-0000-0000-000000000006', TRUE,  NOW() - INTERVAL '15 days'),
                                                                             ('c1000000-0000-0000-0000-000000000013','b1000000-0000-0000-0000-000000000006', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000014','b1000000-0000-0000-0000-000000000007', TRUE,  NOW() - INTERVAL '13 days'),
                                                                             ('c1000000-0000-0000-0000-000000000015','b1000000-0000-0000-0000-000000000007', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000016','b1000000-0000-0000-0000-000000000008', TRUE,  NOW() - INTERVAL '12 days'),
                                                                             ('c1000000-0000-0000-0000-000000000017','b1000000-0000-0000-0000-000000000009', TRUE,  NOW() - INTERVAL '11 days'),
                                                                             ('c1000000-0000-0000-0000-000000000018','b1000000-0000-0000-0000-000000000009', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000019','b1000000-0000-0000-0000-000000000010', TRUE,  NOW() - INTERVAL '10 days'),
                                                                             ('c1000000-0000-0000-0000-000000000020','b1000000-0000-0000-0000-000000000010', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000021','b1000000-0000-0000-0000-000000000011', TRUE,  NOW() - INTERVAL '9 days'),
                                                                             ('c1000000-0000-0000-0000-000000000022','b1000000-0000-0000-0000-000000000011', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000023','b1000000-0000-0000-0000-000000000012', TRUE,  NOW() - INTERVAL '8 days'),
                                                                             ('c1000000-0000-0000-0000-000000000024','b1000000-0000-0000-0000-000000000012', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000025','b1000000-0000-0000-0000-000000000013', TRUE,  NOW() - INTERVAL '7 days'),
                                                                             ('c1000000-0000-0000-0000-000000000026','b1000000-0000-0000-0000-000000000014', TRUE,  NOW() - INTERVAL '6 days'),
                                                                             ('c1000000-0000-0000-0000-000000000027','b1000000-0000-0000-0000-000000000014', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000028','b1000000-0000-0000-0000-000000000015', TRUE,  NOW() - INTERVAL '5 days'),
                                                                             ('c1000000-0000-0000-0000-000000000029','b1000000-0000-0000-0000-000000000016', TRUE,  NOW() - INTERVAL '5 days'),
                                                                             ('c1000000-0000-0000-0000-000000000030','b1000000-0000-0000-0000-000000000017', TRUE,  NOW() - INTERVAL '4 days'),
                                                                             ('c1000000-0000-0000-0000-000000000031','b1000000-0000-0000-0000-000000000017', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000032','b1000000-0000-0000-0000-000000000018', TRUE,  NOW() - INTERVAL '3 days'),
                                                                             ('c1000000-0000-0000-0000-000000000033','b1000000-0000-0000-0000-000000000018', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000034','b1000000-0000-0000-0000-000000000019', TRUE,  NOW() - INTERVAL '2 days'),
                                                                             ('c1000000-0000-0000-0000-000000000035','b1000000-0000-0000-0000-000000000020', TRUE,  NOW() - INTERVAL '2 days'),
                                                                             ('c1000000-0000-0000-0000-000000000036','b1000000-0000-0000-0000-000000000020', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000037','b1000000-0000-0000-0000-000000000021', TRUE,  NOW() - INTERVAL '1 day'),
                                                                             ('c1000000-0000-0000-0000-000000000038','b1000000-0000-0000-0000-000000000021', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000039','b1000000-0000-0000-0000-000000000022', TRUE,  NOW() - INTERVAL '1 day'),
                                                                             ('c1000000-0000-0000-0000-000000000040','b1000000-0000-0000-0000-000000000023', TRUE,  NOW() - INTERVAL '18 hours'),
                                                                             ('c1000000-0000-0000-0000-000000000041','b1000000-0000-0000-0000-000000000024', TRUE,  NOW() - INTERVAL '16 hours'),
                                                                             ('c1000000-0000-0000-0000-000000000042','b1000000-0000-0000-0000-000000000024', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000043','b1000000-0000-0000-0000-000000000025', TRUE,  NOW() - INTERVAL '20 hours'),
                                                                             ('c1000000-0000-0000-0000-000000000044','b1000000-0000-0000-0000-000000000025', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000045','b1000000-0000-0000-0000-000000000026', TRUE,  NOW() - INTERVAL '19 hours'),
                                                                             ('c1000000-0000-0000-0000-000000000046','b1000000-0000-0000-0000-000000000026', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000047','b1000000-0000-0000-0000-000000000027', TRUE,  NOW() - INTERVAL '14 hours'),
                                                                             ('c1000000-0000-0000-0000-000000000048','b1000000-0000-0000-0000-000000000027', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000049','b1000000-0000-0000-0000-000000000028', FALSE, NULL),
                                                                             ('c1000000-0000-0000-0000-000000000050','b1000000-0000-0000-0000-000000000029', TRUE,  NOW() - INTERVAL '8 hours');

-- ============================================================
-- 7. CONTENT + COMMENTS
-- ============================================================
INSERT INTO content (content_id, content_type, author_id, body, vote_score, created_at) VALUES
                                                                                            ('d1000000-0000-0000-0000-000000000001','comment','a1000000-0000-0000-0000-000000000007',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Thank you, the ScrollReset component worked perfectly."}]}]}',
                                                                                             2, NOW() - INTERVAL '27 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000002','comment','a1000000-0000-0000-0000-000000000002',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Does this work with Parallel Routes too? My app uses them and scroll still seems off."}]}]}',
                                                                                             1, NOW() - INTERVAL '27 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000003','comment','a1000000-0000-0000-0000-000000000001',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Parallel Routes are tricky — the pathname changes but the layout segment stays mounted. You may need to listen to the segment rather than the full pathname."}]}]}',
                                                                                             3, NOW() - INTERVAL '26 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000004','comment','a1000000-0000-0000-0000-000000000011',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is the answer I needed. Initialising to empty array solved it immediately."}]}]}',
                                                                                             4, NOW() - INTERVAL '25 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000005','comment','a1000000-0000-0000-0000-000000000010',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The AbortController suggestion is really important for search inputs. Had a race condition exactly like this."}]}]}',
                                                                                             3, NOW() - INTERVAL '24 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000006','comment','a1000000-0000-0000-0000-000000000018',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Does Polars work as a drop-in replacement for pandas? I have a lot of existing pandas code."}]}]}',
                                                                                             1, NOW() - INTERVAL '21 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000007','comment','a1000000-0000-0000-0000-000000000004',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Not a drop-in replacement — the API is different. But for new code it is worth it. For existing code, chunked reading with pandas is the simpler migration."}]}]}',
                                                                                             2, NOW() - INTERVAL '21 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000008','comment','a1000000-0000-0000-0000-000000000014',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The Venn diagram explanation finally made this click for me."}]}]}',
                                                                                             5, NOW() - INTERVAL '18 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000009','comment','a1000000-0000-0000-0000-000000000007',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Worth adding: useCallback in the parent is necessary but not sufficient. If the callback itself references state that changes, you still get a new function. Consider whether you actually need the state in the callback or can pass it as an argument."}]}]}',
                                                                                             4, NOW() - INTERVAL '13 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000010','comment','a1000000-0000-0000-0000-000000000009',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The borrow checker explanation is the most intuitive I have seen. The JavaScript GC analogy really helps."}]}]}',
                                                                                             6, NOW() - INTERVAL '11 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000011','comment','a1000000-0000-0000-0000-000000000012',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"What about storing the access token in memory and using a refresh token in an httpOnly cookie? Is that pattern better?"}]}]}',
                                                                                             3, NOW() - INTERVAL '10 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000012','comment','a1000000-0000-0000-0000-000000000019',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Yes, that is a solid pattern. The access token in memory is lost on page refresh, which forces a refresh token round-trip, but the access token is never persisted anywhere an attacker can reach."}]}]}',
                                                                                             4, NOW() - INTERVAL '10 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000013','comment','a1000000-0000-0000-0000-000000000010',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"We had exactly this problem. VACUUM ANALYZE was the fix — table had 40% bloat from bulk deletes."}]}]}',
                                                                                             5, NOW() - INTERVAL '9 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000014','comment','a1000000-0000-0000-0000-000000000018',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I came from CSS Grid and never fully understood Flexbox until reading this. The ''one dimensional vs two dimensional'' framing is exactly right."}]}]}',
                                                                                             3, NOW() - INTERVAL '8 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000015','comment','a1000000-0000-0000-0000-000000000005',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Also worth checking: if using a multi-stage Docker build, make sure the entrypoint script is actually copied into the final stage."}]}]}',
                                                                                             4, NOW() - INTERVAL '7 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000016','comment','a1000000-0000-0000-0000-000000000014',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The memory profile point is critical. We had to switch some features from WebSocket to SSE exactly because of RAM."}]}]}',
                                                                                             2, NOW() - INTERVAL '6 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000017','comment','a1000000-0000-0000-0000-000000000007',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Verified: applying cors() before routes fixed it. Such a simple thing to miss."}]}]}',
                                                                                             3, NOW() - INTERVAL '4 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000018','comment','a1000000-0000-0000-0000-000000000011',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The useRef pattern for debounce in React is something I had never seen before. Much cleaner than storing state."}]}]}',
                                                                                             2, NOW() - INTERVAL '3 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000019','comment','a1000000-0000-0000-0000-000000000014',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Second order injection is something I had not considered. Worth auditing old code for this."}]}]}',
                                                                                             4, NOW() - INTERVAL '2 days'),

                                                                                            ('d1000000-0000-0000-0000-000000000020','comment','a1000000-0000-0000-0000-000000000010',
                                                                                             '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Good callout on partitioning. We went from 8s queries to 40ms after partitioning a logging table by month."}]}]}',
                                                                                             6, NOW() - INTERVAL '12 hours');

INSERT INTO "comment" (content_id, parent_id, recipient_id) VALUES
-- Comments on Q01's accepted answer
('d1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002'),
-- Comment on Q02's accepted answer
('d1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000003'),
('d1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000006'),
-- Comment on Q03
('d1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000004'),
('d1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000018'),
-- Comment on Q04
('d1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000009','a1000000-0000-0000-0000-000000000006'),
-- Comment on Q07 answer
('d1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000014','a1000000-0000-0000-0000-000000000001'),
-- Comment on Q09 answer
('d1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000018','a1000000-0000-0000-0000-000000000003'),
-- Comments on Q10 answers
('d1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000019','a1000000-0000-0000-0000-000000000019'),
('d1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000019','a1000000-0000-0000-0000-000000000012'),
-- Comment on Q11
('d1000000-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000022','a1000000-0000-0000-0000-000000000006'),
-- Comment on Q12
('d1000000-0000-0000-0000-000000000014','c1000000-0000-0000-0000-000000000023','a1000000-0000-0000-0000-000000000002'),
-- Comment on Q13
('d1000000-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000025','a1000000-0000-0000-0000-000000000005'),
-- Comment on Q14
('d1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000027','a1000000-0000-0000-0000-000000000003'),
-- Comment on Q17
('d1000000-0000-0000-0000-000000000017','c1000000-0000-0000-0000-000000000030','a1000000-0000-0000-0000-000000000012'),
-- Comment on Q18
('d1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000032','a1000000-0000-0000-0000-000000000001'),
-- Comment on Q19
('d1000000-0000-0000-0000-000000000019','c1000000-0000-0000-0000-000000000034','a1000000-0000-0000-0000-000000000019'),
-- Comment on Q24
('d1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000042','a1000000-0000-0000-0000-000000000006');

-- ============================================================
-- 8. VOTES
-- ============================================================
INSERT INTO vote (user_id, content_id, vote_type) VALUES
-- Upvotes on popular questions
('a1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000009', 1),
('a1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000009', 1),
('a1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000025', 1),
('a1000000-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000025', 1),
('a1000000-0000-0000-0000-000000000007','b1000000-0000-0000-0000-000000000010', 1),
('a1000000-0000-0000-0000-000000000008','b1000000-0000-0000-0000-000000000005', 1),
('a1000000-0000-0000-0000-000000000009','b1000000-0000-0000-0000-000000000005', 1),
('a1000000-0000-0000-0000-000000000010','b1000000-0000-0000-0000-000000000004', 1),
('a1000000-0000-0000-0000-000000000011','b1000000-0000-0000-0000-000000000004', 1),
('a1000000-0000-0000-0000-000000000012','b1000000-0000-0000-0000-000000000003', 1),
('a1000000-0000-0000-0000-000000000013','b1000000-0000-0000-0000-000000000025', 1),
('a1000000-0000-0000-0000-000000000014','b1000000-0000-0000-0000-000000000006', 1),
('a1000000-0000-0000-0000-000000000015','b1000000-0000-0000-0000-000000000009', 1),
-- Upvotes on accepted answers
('a1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000017', 1),
('a1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000017', 1),
('a1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000008', 1),
('a1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000043', 1),
('a1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000010', 1),
('a1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000003', 1),
('a1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000019', 1),
('a1000000-0000-0000-0000-000000000014','c1000000-0000-0000-0000-000000000012', 1),
('a1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000026', 1),
('a1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000032', 1),
('a1000000-0000-0000-0000-000000000019','c1000000-0000-0000-0000-000000000043', 1),
('a1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000034', 1);

-- ============================================================
-- 9. BOOKMARKS
-- ============================================================
INSERT INTO bookmark (user_id, content_id) VALUES
                                               ('a1000000-0000-0000-0000-000000000007','b1000000-0000-0000-0000-000000000009'),
                                               ('a1000000-0000-0000-0000-000000000007','b1000000-0000-0000-0000-000000000005'),
                                               ('a1000000-0000-0000-0000-000000000011','b1000000-0000-0000-0000-000000000004'),
                                               ('a1000000-0000-0000-0000-000000000014','b1000000-0000-0000-0000-000000000006'),
                                               ('a1000000-0000-0000-0000-000000000014','b1000000-0000-0000-0000-000000000009'),
                                               ('a1000000-0000-0000-0000-000000000018','b1000000-0000-0000-0000-000000000005'),
                                               ('a1000000-0000-0000-0000-000000000018','b1000000-0000-0000-0000-000000000018'),
                                               ('a1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000007'),
                                               ('a1000000-0000-0000-0000-000000000009','b1000000-0000-0000-0000-000000000010'),
                                               ('a1000000-0000-0000-0000-000000000015','b1000000-0000-0000-0000-000000000024'),
                                               ('a1000000-0000-0000-0000-000000000016','b1000000-0000-0000-0000-000000000014'),
                                               ('a1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000011');

-- ============================================================
-- 10. USER_TAG_FOLLOW
-- ============================================================
INSERT INTO user_tag_follow (user_id, tag_id)
SELECT u.user_id, t.tag_id FROM (VALUES
                                     ('a1000000-0000-0000-0000-000000000001','typescript'),
                                     ('a1000000-0000-0000-0000-000000000001','nextjs'),
                                     ('a1000000-0000-0000-0000-000000000001','postgresql'),
                                     ('a1000000-0000-0000-0000-000000000002','react'),
                                     ('a1000000-0000-0000-0000-000000000002','css'),
                                     ('a1000000-0000-0000-0000-000000000003','go'),
                                     ('a1000000-0000-0000-0000-000000000003','concurrency'),
                                     ('a1000000-0000-0000-0000-000000000004','python'),
                                     ('a1000000-0000-0000-0000-000000000004','machine-learning'),
                                     ('a1000000-0000-0000-0000-000000000005','docker'),
                                     ('a1000000-0000-0000-0000-000000000005','kubernetes'),
                                     ('a1000000-0000-0000-0000-000000000006','security'),
                                     ('a1000000-0000-0000-0000-000000000007','react'),
                                     ('a1000000-0000-0000-0000-000000000007','nextjs'),
                                     ('a1000000-0000-0000-0000-000000000008','rust'),
                                     ('a1000000-0000-0000-0000-000000000009','react-native'),
                                     ('a1000000-0000-0000-0000-000000000010','postgresql'),
                                     ('a1000000-0000-0000-0000-000000000010','sql'),
                                     ('a1000000-0000-0000-0000-000000000011','javascript'),
                                     ('a1000000-0000-0000-0000-000000000013','pytorch'),
                                     ('a1000000-0000-0000-0000-000000000014','algorithms'),
                                     ('a1000000-0000-0000-0000-000000000014','data-structures'),
                                     ('a1000000-0000-0000-0000-000000000016','aws'),
                                     ('a1000000-0000-0000-0000-000000000016','terraform'),
                                     ('a1000000-0000-0000-0000-000000000019','security'),
                                     ('a1000000-0000-0000-0000-000000000019','jwt')
                                ) AS v(uid, tname)
                                    JOIN "user" u ON u.user_id = v.uid::uuid
                                    JOIN tag t ON t.name = v.tname
ON CONFLICT DO NOTHING;

COMMIT;