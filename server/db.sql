PRAGMA foreign_keys
= ON;

CREATE TABLE courses (
    course_id integer PRIMARY KEY AUTOINCREMENT,
    code varchar,
    name varchar,
    -- In SP18 form
    semester varchar
);

CREATE TABLE users
(
    netid varchar PRIMARY KEY,
    name varchar
);

CREATE TABLE course_users
(
    course_id integer,
    user varchar,
    status varchar,
    PRIMARY KEY
    (course_id, user),
    FOREIGN KEY
    (course_id) REFERENCES courses
    (course_id),
    FOREIGN KEY
    (user) REFERENCES users
    (netid)
);

    CREATE TABLE sessions (
    session_id integer PRIMARY KEY AUTOINCREMENT,
    start datetime,
    end datetime,
    location varchar,
    course_id integer,
    FOREIGN KEY
    (course_id) REFERENCES courses
    (course_id)
);

    CREATE TABLE session_tas
    (
        session_id integer,
        ta varchar,
        PRIMARY KEY(session_id, ta),
        FOREIGN KEY(session_id) REFERENCES sessions(session_id),
        FOREIGN KEY(ta) REFERENCES users(netid)
    );

    CREATE TABLE questions (
    question_id integer PRIMARY KEY AUTOINCREMENT,
    value text,
    time_entered datetime DEFAULT CURRENT_TIMESTAMP,
    status text,
    time_resolved datetime,
    session_id integer,
    student varchar,
    FOREIGN KEY
    (session_id) REFERENCES sessions
    (session_id),
    FOREIGN KEY
    (student) REFERENCES users
    (netid)
);

    CREATE TABLE question_followers
    (
        question_id integer,
        follower varchar,
        PRIMARY KEY (question_id, follower),
        FOREIGN KEY(question_id) REFERENCES questions(question_id),
        FOREIGN KEY(follower) REFERENCES users(netid)
    );

    CREATE TABLE tags (
    tag_id integer PRIMARY KEY AUTOINCREMENT,
    value text,
    course_id integer,
    FOREIGN KEY
    (course_id) REFERENCES courses
    (course_id)
);

    CREATE TABLE question_tags
    (
        tag_id integer,
        question_id integer,
        PRIMARY KEY(tag_id, question_id),
        FOREIGN KEY(tag_id) REFERENCES tags(tag_id),
        FOREIGN KEY(question_id) REFERENCES questions(question_id)
    );



    -- Initialization data
    INSERT INTO users('netid', 'name')
    VALUES
        ('hh498', 'Horace'),
        ('ks123', 'Karun'),
        ('js234', 'Joyelle');

    INSERT INTO courses('name', 'semester')
    VALUES
        ('CS2800', 'FA17'),
        ('CS6832', 'FA17'),
        ('CS3110', 'FA17');


    INSERT INTO course_users('user', 'course_id', 'status')
    VALUES
        ('hh498', (select course_id
            from courses
            where name='CS2800'), 'student'),
        ('hh498', (select course_id
            from courses
            where name='CS6832'), 'student'),
        ('hh498', (select course_id
            from courses
            where name='CS3110'), 'student'),
        ('ks123', (select course_id
            from courses
            where name='CS2800'), 'student');

    -- I realize these are wrong, but it seems like a pain to change the dates right now.
    INSERT INTO sessions('start', 'end', 'location', 'course_id')
    VALUES
        (1485360000, 1485363600, 'Gates G11', (select course_id
            from courses
            where name='CS2800')),
        (1485363600, 1485367200, 'Rhodes 402', (select course_id
            from courses
            where name='CS2800')),
        (1485360000, 1485363600, 'Gates G13', (select course_id
            from courses
            where name='CS3110'));

    INSERT INTO session_tas('session_id', 'ta')
    VALUES
        ('1', 'js234'),
        ('2', 'js234'),
        ('3', 'js234'),
        ('3', 'ks123');

    INSERT INTO course_users('user', 'course_id', 'status')
    VALUES
        ('js234', (select course_id
            from courses
            where name='CS2800'), 'ta'),
        ('js234', (select course_id
            from courses
            where name='CS6832'), 'ta'),
        ('js234', (select course_id
            from courses
            where name='CS3110'), 'ta'),
        ('ks123', (select course_id
            from courses
            where name='CS3110'), 'ta');

    INSERT INTO questions('value', 'session_id', 'student')
    VALUES
        ('How do I program?', 1, 'hh498'),
        ('How do I install this?', 1, 'hh498');

    INSERT INTO tags('value', 'course_id')
    VALUES
        ('assignment 1', (select course_id
            from courses
            where name='CS2800')),
        ('coding help', (select course_id
            from courses
            where name='CS2800')),
        ('other', (select course_id
            from courses
            where name='CS2800'));

    INSERT INTO question_tags('tag_id', 'question_id')
    VALUES
        (1, 1),
        (2, 1);