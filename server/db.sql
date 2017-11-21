
CREATE TABLE courses (
    course_id integer PRIMARY KEY AUTOINCREMENT,
    name varchar,
    semester varchar
);

CREATE TABLE sessions (
    course_id integer,
    taid integer,
    time varchar,
    location varchar,
    session_id integer PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE questions (
    question_id integer PRIMARY KEY AUTOINCREMENT,
    session_id integer,
    text text,
    timeentered varchar,
    studentid integer
);

create table students (
    netid varchar PRIMARY KEY,
    name varchar
);

CREATE TABLE course_students (
    course_id integer,
    student_id integer
);

CREATE TABLE question_tags (
    tag_id integer,
    question_id integer
);

CREATE TABLE tags (
    tag_id integer PRIMARY KEY AUTOINCREMENT,
    course_id integer,
    value text
);

CREATE TABLE course_tas (
    course_id integer,
    studentid integer
);

