
CREATE TABLE courses (
    course_id integer PRIMARY KEY AUTOINCREMENT,
    name varchar,
    semester varchar
);

CREATE TABLE sessions (
    session_id integer PRIMARY KEY AUTOINCREMENT,
    time varchar,
    location varchar,
    course_id integer,
    ta_id varchar,
    FOREIGN KEY(course_id) REFERENCES courses(course_id),
    FOREIGN KEY(ta_id) REFERENCES students(netid)
);

CREATE TABLE questions (
    question_id integer PRIMARY KEY AUTOINCREMENT,
    text text,
    timeentered varchar,
    session_id integer,
    netid varchar,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id),
    FOREIGN KEY(netid) REFERENCES students(netid)
);

create table students (
    netid varchar PRIMARY KEY,
    name varchar
);

CREATE TABLE course_students (
    course_id integer,
    netid varchar,
    FOREIGN KEY(course_id) REFERENCES courses(course_id),
    FOREIGN KEY(netid) REFERENCES students(netid)
);

CREATE TABLE question_tags (
    tag_id integer,
    question_id integer,
    FOREIGN KEY(tag_id) REFERENCES tags(tag_id),
    FOREIGN KEY(question_id) REFERENCES questions(question_id)
);

CREATE TABLE tags (
    tag_id integer PRIMARY KEY AUTOINCREMENT,
    value text,
    course_id integer,
    FOREIGN KEY(course_id) REFERENCES courses(course_id)
);

CREATE TABLE course_tas (
    course_id integer,
    netid varchar,
    FOREIGN KEY(course_id) REFERENCES courses(course_id),
    FOREIGN KEY(netid) REFERENCES students(netid)
);

