PRAGMA foreign_keys = ON;

CREATE TABLE courses (
    course_id integer PRIMARY KEY AUTOINCREMENT,
    name varchar,
    semester varchar
);

create table students (
    netid varchar PRIMARY KEY,
    name varchar
);

CREATE TABLE course_students (
    course_id integer,
    netid varchar,
    PRIMARY KEY(course_id, netid),
    FOREIGN KEY(course_id) REFERENCES courses(course_id),
    FOREIGN KEY(netid) REFERENCES students(netid)
);

CREATE TABLE course_tas (
    course_id integer,
    ta varchar,
    PRIMARY KEY(course_id, ta),
    FOREIGN KEY(course_id) REFERENCES courses(course_id),
    FOREIGN KEY(ta) REFERENCES students(netid)
);

CREATE TABLE sessions (
    session_id integer PRIMARY KEY AUTOINCREMENT,
    time varchar,
    location varchar,
    course_id integer,
    FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

CREATE TABLE session_tas (
    session_id integer,
    ta varchar,
    PRIMARY KEY(session_id, ta),
    FOREIGN KEY(session_id) REFERENCES sessions(session_id),
    FOREIGN KEY(ta) REFERENCES students(netid)
);

CREATE TABLE questions (
    question_id integer PRIMARY KEY AUTOINCREMENT,
    text text,
    time_entered datetime DEFAULT CURRENT_TIMESTAMP,
    session_id integer,
    student varchar,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id),
    FOREIGN KEY(student) REFERENCES students(netid)
);


CREATE TABLE tags (
    tag_id integer PRIMARY KEY AUTOINCREMENT,
    value text,
    course_id integer,
    FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

CREATE TABLE question_tags (
    tag_id integer,
    question_id integer,
    PRIMARY KEY(tag_id, question_id),
    FOREIGN KEY(tag_id) REFERENCES tags(tag_id),
    FOREIGN KEY(question_id) REFERENCES questions(question_id)
);



-- Initialization data
INSERT INTO students('netid', 'name')
VALUES
('hh498', 'Horace'),
('ks123', 'Karun'),
('js234', 'Joyelle');

INSERT INTO courses('name', 'semester')
VALUES
('CS2800', 'FA17'),
('CS6832', 'FA17'),
('CS3110', 'FA17');


INSERT INTO course_students('netid', 'course_id')
VALUES
('hh498', (select course_id from courses where name='CS2800')),
('hh498', (select course_id from courses where name='CS6832')),
('hh498', (select course_id from courses where name='CS3110')),
('ks123', (select course_id from courses where name='CS2800'));

INSERT INTO sessions('time', 'location', 'course_id')
VALUES
('8:30', 'Baker', (select course_id from courses where name='CS2800')),
('11:30', 'Gates', (select course_id from courses where name='CS2800')),
('4:00', 'Baker', (select course_id from courses where name='CS3110'));

INSERT INTO session_tas('session_id', 'ta')
VALUES
('1', 'js234'),
('2', 'js234'),
('3', 'js234'),
('3', 'ks123');

INSERT INTO course_tas('ta', 'course_id')
VALUES
('js234', (select course_id from courses where name='CS2800')),
('js234', (select course_id from courses where name='CS6832')),
('js234', (select course_id from courses where name='CS3110')),
('ks123', (select course_id from courses where name='CS3110'));

INSERT INTO questions('text', 'session_id', 'student')
VALUES
('How do I program?', 1, 'hh498'),
('How do I install this?', 1, 'hh498');

INSERT INTO tags('value', 'course_id')
VALUES
('assignment 1', (select course_id from courses where name='CS2800')),
('coding help', (select course_id from courses where name='CS2800')),
('other', (select course_id from courses where name='CS2800'));

INSERT INTO question_tags('tag_id', 'question_id')
VALUES
(1, 1),
(2, 1);