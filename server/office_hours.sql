--
-- PostgreSQL database dump
--

-- Dumped from database version 10.2
-- Dumped by pg_dump version 10.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE questions (
    question_id integer NOT NULL,
    content text NOT NULL,
    time_entered timestamp without time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    time_resolved timestamp without time zone,
    session_id integer NOT NULL,
    asker_id integer NOT NULL,
    answerer_id integer
);


--
-- Name: add_question_with_tags(text, text, integer, integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION add_question_with_tags(content text, status text, session_id integer, asker_id integer, tags integer[]) RETURNS SETOF questions
    LANGUAGE plpgsql
    AS $$
DECLARE
inserted_question integer;
tag integer;

BEGIN
INSERT INTO questions(content, status, session_id, asker_id)
VALUES
(content, status, session_id, asker_id) returning question_id INTO inserted_question;
FOREACH tag in ARRAY tags
LOOP
INSERT INTO question_tags(question_id, tag_id) VALUES (inserted_question, tag);
END LOOP;
RETURN QUERY select * from questions where question_id = inserted_question;
END
$$;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE sessions (
    session_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    building text,
    room text,
    session_series_id integer,
    course_id integer
);


--
-- Name: create_sessions_from_session_series(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION create_sessions_from_session_series(series integer) RETURNS SETOF sessions
    LANGUAGE plpgsql
    AS $$
DECLARE
course integer;
building text;
room text;
start_date timestamp;
end_date timestamp;
cur_date timestamp;
session_start_time timestamp;
session_end_time timestamp;
session_start_offset interval;
session_end_offset interval;
BEGIN
IF (SELECT COUNT(*) FROM sessions where session_series_id = series) > 0 THEN
    RAISE EXCEPTION 'sessions with this series_id already exist';
END IF;
course := (SELECT course_id FROM session_series WHERE session_series_id = series);
start_date := date_trunc('week', (SELECT courses.start_date from courses WHERE course_id = course));
end_date := date_trunc('week', (SELECT courses.end_date from courses WHERE course_id = course));
SELECT session_series.start_time, session_series.end_time, session_series.building, session_series.room
	INTO session_start_time, session_end_time, building, room
	FROM session_series WHERE session_series_id = series;
session_start_offset := session_start_time - date_trunc('week', session_start_time);
session_end_offset := session_end_time - date_trunc('week', session_end_time) ;
cur_date := start_date;
while cur_date < end_date LOOP
    INSERT INTO sessions(start_time, end_time, building, room, session_series_id, course_id)
    VALUES
    (cur_date + session_start_offset, cur_date + session_end_offset, building, room, series, course);

    cur_date := cur_date + interval '1 week';
END LOOP;
RETURN QUERY select * from sessions where session_series_id = series;
END
$$;


--
-- Name: delete_session_series(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION delete_session_series(_series_id integer) RETURNS SETOF sessions
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
DELETE FROM sessions WHERE session_series_id = _series_id AND start_time > now();
DELETE FROM session_series_tas WHERE session_series_id = _series_id;
UPDATE sessions
SET session_series_id = NULL WHERE session_series_id = _series_id;
DELETE FROM session_series WHERE session_series_id = _series_id;
END
$$;


--
-- Name: edit_session_series(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION edit_session_series(series integer) RETURNS SETOF sessions
    LANGUAGE plpgsql
    AS $$
DECLARE
_start_time timestamp;
_end_time timestamp;
_building text;
_room text;
_course_id integer;
_session_start_offset interval;
_session_end_offset interval;
BEGIN
SELECT ss.start_time, ss.end_time, ss.building, ss.room, ss.course_id INTO _start_time, _end_time, _building, _room, _course_id
FROM session_series AS ss WHERE session_series_id = series;
_session_start_offset := _start_time - date_trunc('week', _start_time);
_session_end_offset := _end_time - date_trunc('week', _end_time);

UPDATE sessions
SET (start_time, end_time, _building, _room, course_id) = (date_trunc('week', sessions.start_time) + _session_start_offset, date_trunc('week', sessions.end_time) + _session_end_offset, _building, _room, _course_id)
WHERE session_series_id = series AND start_time > now();
RETURN QUERY select * from sessions where session_series_id = series AND start_time > now();
END
$$;


--
-- Name: search_session_range(integer, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION search_session_range(course integer, begintime timestamp without time zone, endtime timestamp without time zone) RETURNS SETOF sessions
    LANGUAGE sql STABLE
    AS $$
select * from sessions where start_time > begintime AND start_time < endtime AND course_id = course
$$;


--
-- Name: course_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE course_users (
    course_id integer NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE courses (
    course_id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    semester text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);


--
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE courses_course_id_seq OWNED BY courses.course_id;


--
-- Name: question_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE question_tags (
    question_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE questions_question_id_seq OWNED BY questions.question_id;


--
-- Name: sessionTas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "sessionTas" (
    session_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: session_series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE session_series (
    session_series_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    building text NOT NULL,
    room text NOT NULL,
    course_id integer NOT NULL
);


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE session_series_session_series_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE session_series_session_series_id_seq OWNED BY session_series.session_series_id;


--
-- Name: session_series_tas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE session_series_tas (
    session_series_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE sessions_session_id_seq OWNED BY sessions.session_id;


--
-- Name: tag_relations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tag_relations (
    parent_id integer NOT NULL,
    child_id integer NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tags (
    tag_id integer NOT NULL,
    name text NOT NULL,
    course_id integer NOT NULL,
    level integer NOT NULL
);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tags_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tags_tag_id_seq OWNED BY tags.tag_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    user_id integer NOT NULL,
    net_id text NOT NULL,
    google_id text NOT NULL,
    first_name text,
    last_name text,
    created_at timestamp without time zone,
    last_activity_at timestamp without time zone,
    photo_url text
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_user_id_seq OWNED BY users.user_id;


--
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY courses ALTER COLUMN course_id SET DEFAULT nextval('courses_course_id_seq'::regclass);


--
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions ALTER COLUMN question_id SET DEFAULT nextval('questions_question_id_seq'::regclass);


--
-- Name: session_series session_series_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series ALTER COLUMN session_series_id SET DEFAULT nextval('session_series_session_series_id_seq'::regclass);


--
-- Name: sessions session_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions ALTER COLUMN session_id SET DEFAULT nextval('sessions_session_id_seq'::regclass);


--
-- Name: tags tag_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags ALTER COLUMN tag_id SET DEFAULT nextval('tags_tag_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN user_id SET DEFAULT nextval('users_user_id_seq'::regclass);


--
-- Data for Name: course_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY course_users (course_id, user_id, role) FROM stdin;
1	8	professor
1	1	ta
1	3	ta
1	6	ta
1	2	student
1	4	student
1	5	student
1	7	student
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY courses (course_id, code, name, semester, start_date, end_date) FROM stdin;
1	CS 1380	Data Science For All	SP18	2018-01-24	2018-05-13
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY question_tags (question_id, tag_id) FROM stdin;
1	1
1	9
2	2
2	13
3	5
3	21
4	7
4	25
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY questions (question_id, content, time_entered, status, time_resolved, session_id, asker_id, answerer_id) FROM stdin;
2	Dataset parsing for Q2	2018-03-26 10:01:33	unresolved	\N	1	4	\N
3	Clarifying statistics concept from prelim	2018-03-26 10:03:12	unresolved	\N	1	7	\N
1	How do you implement recursion in Question 2?	2018-03-26 09:47:33	resolved	2018-03-26 10:06:49	1	2	1
4	Question about course grading	2018-03-26 10:07:39	unresolved	\N	1	5	\N
\.


--
-- Data for Name: sessionTas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "sessionTas" (session_id, user_id) FROM stdin;
7	3
7	6
\.


--
-- Data for Name: session_series; Type: TABLE DATA; Schema: public; Owner: -
--

COPY session_series (session_series_id, start_time, end_time, building, room, course_id) FROM stdin;
1	2018-03-26 10:00:00	2018-03-26 11:00:00	Gates	G21	1
2	2018-03-26 12:20:00	2018-03-26 13:10:00	Academic Surge A Office	101	1
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Academic Surge A Office	102	1
4	2018-03-26 19:00:00	2018-03-26 20:15:00	Gates	G17	1
\.


--
-- Data for Name: session_series_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY session_series_tas (session_series_id, user_id) FROM stdin;
2	8
3	3
4	6
1	3
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY sessions (session_id, start_time, end_time, building, room, session_series_id, course_id) FROM stdin;
143	2018-01-22 12:20:00	2018-01-22 13:10:00	Academic Surge A Office	101	2	1
144	2018-01-29 12:20:00	2018-01-29 13:10:00	Academic Surge A Office	101	2	1
145	2018-02-05 12:20:00	2018-02-05 13:10:00	Academic Surge A Office	101	2	1
146	2018-02-12 12:20:00	2018-02-12 13:10:00	Academic Surge A Office	101	2	1
147	2018-02-19 12:20:00	2018-02-19 13:10:00	Academic Surge A Office	101	2	1
148	2018-02-26 12:20:00	2018-02-26 13:10:00	Academic Surge A Office	101	2	1
149	2018-03-05 12:20:00	2018-03-05 13:10:00	Academic Surge A Office	101	2	1
150	2018-03-12 12:20:00	2018-03-12 13:10:00	Academic Surge A Office	101	2	1
151	2018-03-19 12:20:00	2018-03-19 13:10:00	Academic Surge A Office	101	2	1
152	2018-03-26 12:20:00	2018-03-26 13:10:00	Academic Surge A Office	101	2	1
153	2018-04-02 12:20:00	2018-04-02 13:10:00	Academic Surge A Office	101	2	1
154	2018-04-09 12:20:00	2018-04-09 13:10:00	Academic Surge A Office	101	2	1
155	2018-04-16 12:20:00	2018-04-16 13:10:00	Academic Surge A Office	101	2	1
156	2018-04-23 12:20:00	2018-04-23 13:10:00	Academic Surge A Office	101	2	1
157	2018-04-30 12:20:00	2018-04-30 13:10:00	Academic Surge A Office	101	2	1
4	2018-03-26 19:00:00	2018-03-26 20:30:00	Gates	G12	4	1
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Rhodes	412	4	1
1	2018-03-26 10:00:00	2018-03-26 11:00:00	Gates	G14	2	1
5	2018-04-02 10:00:00	2018-04-02 11:00:00	Gates	G11	2	1
7	2018-04-02 19:00:00	2018-04-02 20:30:00	Gates	G14	3	1
\.


--
-- Data for Name: tag_relations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY tag_relations (parent_id, child_id) FROM stdin;
1	8
1	9
1	10
2	11
2	12
2	13
2	14
3	15
3	16
3	17
4	18
4	19
5	20
5	21
6	22
6	23
7	24
7	25
7	26
7	27
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY tags (tag_id, name, course_id, level) FROM stdin;
1	Assignment 1	1	1
2	Assignment 2	1	1
3	Assignment 3	1	1
4	Assignment 4	1	1
5	Prelim	1	1
6	Final	1	1
7	General	1	1
8	Q1	1	2
9	Q2	1	2
10	Q3	1	2
11	Q1	1	2
12	Q2	1	2
13	Q3	1	2
14	Q4	1	2
15	Q1a	1	2
16	Q1b	1	2
17	Q2	1	2
18	Written Part	1	2
19	Programming	1	2
20	Regrade	1	2
21	Feedback	1	2
22	Regrade	1	2
23	Feedback	1	2
24	Logistics	1	2
25	Grading	1	2
26	Office Hours	1	2
27	Other	1	2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY users (user_id, net_id, google_id, first_name, last_name, created_at, last_activity_at, photo_url) FROM stdin;
1	cv231	115064340704113209584	Corey	Valdez	2018-03-25 03:07:23.485	2018-03-25 03:07:26.391	\N
2	ejs928	139064340704113209582	Edgar	Stewart	2018-03-25 03:08:05.668	2018-03-25 03:08:08.294	\N
3	asm2292	115064340704118374059	Ada	Morton	2018-03-25 03:08:51.563	2018-03-25 03:08:54.084	\N
4	cr848	215064340704113209584	Caroline	Robinson	2018-03-25 03:09:25.563	2018-03-25 03:09:28.525	\N
5	ca449	115064340704113209332	Christopher	Arnold	2018-03-25 03:10:28.166	2018-03-25 03:10:32.518	\N
6	zz527	115064340704113209009	Zechen	Zhang	2018-03-25 03:11:20.394	2018-03-25 03:11:22.765	\N
7	sjw748	115064340704113209877	Susan	Wilson	2018-03-25 03:12:45.328	2018-03-25 03:12:47.826	\N
8	mjc334	115064340704113209999	Michael	Clarkson	2018-03-25 03:13:26.996	2018-03-25 03:13:29.4	\N
\.


--
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('courses_course_id_seq', 1, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('questions_question_id_seq', 8, true);


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('session_series_session_series_id_seq', 4, true);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('sessions_session_id_seq', 157, true);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('tags_tag_id_seq', 35, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('users_user_id_seq', 8, true);


--
-- Name: courses courses_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY courses
    ADD CONSTRAINT courses_pk PRIMARY KEY (course_id);


--
-- Name: course_users courseusers_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY course_users
    ADD CONSTRAINT courseusers_pk PRIMARY KEY (course_id, user_id);


--
-- Name: questions questions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pk PRIMARY KEY (question_id);


--
-- Name: question_tags questiontags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY question_tags
    ADD CONSTRAINT questiontags_pk PRIMARY KEY (question_id, tag_id);


--
-- Name: sessions sessions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pk PRIMARY KEY (session_id);


--
-- Name: session_series sessionseries_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series
    ADD CONSTRAINT sessionseries_pk PRIMARY KEY (session_series_id);


--
-- Name: session_series_tas sessionseriestas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series_tas
    ADD CONSTRAINT sessionseriestas_pk PRIMARY KEY (session_series_id, user_id);


--
-- Name: sessionTas sessiontas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "sessionTas"
    ADD CONSTRAINT sessiontas_pk PRIMARY KEY (session_id, user_id);


--
-- Name: tag_relations tagrelations_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tag_relations
    ADD CONSTRAINT tagrelations_pk PRIMARY KEY (parent_id, child_id);


--
-- Name: tags tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pk PRIMARY KEY (tag_id);


--
-- Name: users users_googleId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT "users_googleId_key" UNIQUE (google_id);


--
-- Name: users users_netId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT "users_netId_key" UNIQUE (net_id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pk PRIMARY KEY (user_id);


--
-- Name: course_users course_users_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY course_users
    ADD CONSTRAINT course_users_fk0 FOREIGN KEY (course_id) REFERENCES courses(course_id);


--
-- Name: course_users course_users_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY course_users
    ADD CONSTRAINT course_users_fk1 FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: sessions fk_session_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT fk_session_course FOREIGN KEY (course_id) REFERENCES courses(course_id);


--
-- Name: question_tags question_tags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY question_tags
    ADD CONSTRAINT question_tags_fk0 FOREIGN KEY (question_id) REFERENCES questions(question_id);


--
-- Name: question_tags question_tags_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY question_tags
    ADD CONSTRAINT question_tags_fk1 FOREIGN KEY (tag_id) REFERENCES tags(tag_id);


--
-- Name: questions questions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_fk0 FOREIGN KEY (session_id) REFERENCES sessions(session_id);


--
-- Name: questions questions_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_fk1 FOREIGN KEY (asker_id) REFERENCES users(user_id);


--
-- Name: questions questions_fk2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_fk2 FOREIGN KEY (answerer_id) REFERENCES users(user_id);


--
-- Name: sessionTas sessionTas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "sessionTas"
    ADD CONSTRAINT "sessionTas_fk0" FOREIGN KEY (session_id) REFERENCES sessions(session_id);


--
-- Name: sessionTas sessionTas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "sessionTas"
    ADD CONSTRAINT "sessionTas_fk1" FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: session_series_tas session_seriesTas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series_tas
    ADD CONSTRAINT "session_seriesTas_fk0" FOREIGN KEY (session_series_id) REFERENCES session_series(session_series_id);


--
-- Name: session_series_tas session_seriesTas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series_tas
    ADD CONSTRAINT "session_seriesTas_fk1" FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: session_series session_series_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series
    ADD CONSTRAINT session_series_fk0 FOREIGN KEY (course_id) REFERENCES courses(course_id);


--
-- Name: sessions sessions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_fk0 FOREIGN KEY (session_series_id) REFERENCES session_series(session_series_id);


--
-- Name: tag_relations tag_relations_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tag_relations
    ADD CONSTRAINT tag_relations_fk0 FOREIGN KEY (parent_id) REFERENCES tags(tag_id);


--
-- Name: tag_relations tag_relations_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tag_relations
    ADD CONSTRAINT tag_relations_fk1 FOREIGN KEY (child_id) REFERENCES tags(tag_id);


--
-- Name: tags tags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_fk0 FOREIGN KEY (course_id) REFERENCES courses(course_id);


--
-- PostgreSQL database dump complete
--

