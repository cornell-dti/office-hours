--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3
-- Dumped by pg_dump version 10.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
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


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    session_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    building text,
    room text,
    session_series_id integer,
    course_id integer
);


--
-- Name: search_session_range(integer, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_session_range(course integer, begintime timestamp without time zone, endtime timestamp without time zone) RETURNS SETOF public.sessions
    LANGUAGE sql STABLE
    AS $$
select * from sessions where start_time > begintime AND start_time < endtime
$$;


--
-- Name: course_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_users (
    course_id integer NOT NULL,
    user_id integer NOT NULL,
    role text NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
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

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- Name: question_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_tags (
    question_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    content text NOT NULL,
    time_entered timestamp without time zone NOT NULL,
    status text NOT NULL,
    time_resolved timestamp without time zone,
    session_id integer NOT NULL,
    asker_id integer NOT NULL,
    answerer_id integer
);


--
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;


--
-- Name: session_series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_series (
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

CREATE SEQUENCE public.session_series_session_series_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.session_series_session_series_id_seq OWNED BY public.session_series.session_series_id;


--
-- Name: session_series_tas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_series_tas (
    session_series_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: session_tas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_tas (
    session_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_session_id_seq OWNED BY public.sessions.session_id;


--
-- Name: tag_relations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag_relations (
    parent_id integer NOT NULL,
    child_id integer NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    tag_id integer NOT NULL,
    name text NOT NULL,
    course_id integer NOT NULL,
    level integer NOT NULL
);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tags_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tags_tag_id_seq OWNED BY public.tags.tag_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    "netId" text NOT NULL,
    "googleId" text NOT NULL,
    "firstName" text,
    "lastName" text,
    "createdAt" timestamp without time zone,
    "lastActivityAt" timestamp without time zone
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- Name: session_series session_series_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series ALTER COLUMN session_series_id SET DEFAULT nextval('public.session_series_session_series_id_seq'::regclass);


--
-- Name: sessions session_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN session_id SET DEFAULT nextval('public.sessions_session_id_seq'::regclass);


--
-- Name: tags tag_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN tag_id SET DEFAULT nextval('public.tags_tag_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: course_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_users (course_id, user_id, role) FROM stdin;
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

COPY public.courses (course_id, code, name, semester, start_date, end_date) FROM stdin;
1	CS 1380	Data Science For All	SP18	2018-01-24	2018-05-13
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.question_tags (question_id, tag_id) FROM stdin;
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

COPY public.questions (question_id, content, time_entered, status, time_resolved, session_id, asker_id, answerer_id) FROM stdin;
2	Dataset parsing for Q2	2018-03-26 10:01:33	unresolved	\N	1	4	\N
3	Clarifying statistics concept from prelim	2018-03-26 10:03:12	unresolved	\N	1	7	\N
1	How do you implement recursion in Question 2?	2018-03-26 09:47:33	resolved	2018-03-26 10:06:49	1	2	1
4	Question about course grading	2018-03-26 10:07:39	unresolved	\N	1	5	\N
\.


--
-- Data for Name: session_series; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_series (session_series_id, start_time, end_time, building, room, course_id) FROM stdin;
1	2018-03-26 10:00:00	2018-03-26 11:00:00	Gates	G21	1
2	2018-03-26 12:20:00	2018-03-26 13:10:00	Academic Surge 	Office 101	1
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Academic Surge	Office 102	1
4	2018-03-26 19:00:00	2018-03-26 20:15:00	Gates	G17	1
\.


--
-- Data for Name: session_series_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_series_tas (session_series_id, user_id) FROM stdin;
1	1
2	8
3	3
4	6
\.


--
-- Data for Name: session_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_tas (session_id, user_id) FROM stdin;
7	3
7	6
8	6
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (session_id, start_time, end_time, building, room, session_series_id, course_id) FROM stdin;
1	2018-03-26 10:00:00	2018-03-26 11:00:00	\N	\N	1	\N
2	2018-03-26 12:20:00	2018-03-26 13:10:00	\N	\N	2	\N
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Rhodes	412	3	\N
6	2018-04-02 12:20:00	2018-04-02 13:10:00	Gates	G11	2	\N
4	2018-03-26 19:00:00	2018-03-26 20:30:00	\N	\N	4	\N
5	2018-04-02 10:00:00	2018-04-02 11:00:00	\N	\N	1	\N
7	2018-04-02 19:00:00	2018-04-02 20:30:00	\N	\N	4	\N
8	2018-04-03 17:00:00	2018-04-03 17:30:00	Upson	B60	\N	1
\.


--
-- Data for Name: tag_relations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tag_relations (parent_id, child_id) FROM stdin;
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

COPY public.tags (tag_id, name, course_id, level) FROM stdin;
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

COPY public.users (user_id, "netId", "googleId", "firstName", "lastName", "createdAt", "lastActivityAt") FROM stdin;
1	cv231	115064340704113209584	Corey	Valdez	2018-03-25 03:07:23.485	2018-03-25 03:07:26.391
2	ejs928	139064340704113209582	Edgar	Stewart	2018-03-25 03:08:05.668	2018-03-25 03:08:08.294
3	asm2292	115064340704118374059	Ada	Morton	2018-03-25 03:08:51.563	2018-03-25 03:08:54.084
4	cr848	215064340704113209584	Caroline	Robinson	2018-03-25 03:09:25.563	2018-03-25 03:09:28.525
5	ca449	115064340704113209332	Christopher	Arnold	2018-03-25 03:10:28.166	2018-03-25 03:10:32.518
6	zz527	115064340704113209009	Zechen	Zhang	2018-03-25 03:11:20.394	2018-03-25 03:11:22.765
7	sjw748	115064340704113209877	Susan	Wilson	2018-03-25 03:12:45.328	2018-03-25 03:12:47.826
8	mjc334	115064340704113209999	Michael	Clarkson	2018-03-25 03:13:26.996	2018-03-25 03:13:29.4
\.


--
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 1, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 4, true);


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.session_series_session_series_id_seq', 4, true);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_session_id_seq', 8, true);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_tag_id_seq', 27, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 8, true);


--
-- Name: courses courses_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pk PRIMARY KEY (course_id);


--
-- Name: course_users courseusers_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_users
    ADD CONSTRAINT courseusers_pk PRIMARY KEY (course_id, user_id);


--
-- Name: questions questions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pk PRIMARY KEY (question_id);


--
-- Name: question_tags questiontags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT questiontags_pk PRIMARY KEY (question_id, tag_id);


--
-- Name: session_tas session_tas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_tas
    ADD CONSTRAINT session_tas_pk PRIMARY KEY (session_id, user_id);


--
-- Name: sessions sessions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pk PRIMARY KEY (session_id);


--
-- Name: session_series sessionseries_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series
    ADD CONSTRAINT sessionseries_pk PRIMARY KEY (session_series_id);


--
-- Name: session_series_tas sessionseriestas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series_tas
    ADD CONSTRAINT sessionseriestas_pk PRIMARY KEY (session_series_id, user_id);


--
-- Name: tag_relations tagrelations_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_relations
    ADD CONSTRAINT tagrelations_pk PRIMARY KEY (parent_id, child_id);


--
-- Name: tags tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pk PRIMARY KEY (tag_id);


--
-- Name: users users_googleId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_googleId_key" UNIQUE ("googleId");


--
-- Name: users users_netId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_netId_key" UNIQUE ("netId");


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (user_id);


--
-- Name: course_users course_users_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_users
    ADD CONSTRAINT course_users_fk0 FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- Name: course_users course_users_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_users
    ADD CONSTRAINT course_users_fk1 FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: sessions fk_session_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_session_course FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- Name: question_tags question_tags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT question_tags_fk0 FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- Name: question_tags question_tags_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT question_tags_fk1 FOREIGN KEY (tag_id) REFERENCES public.tags(tag_id);


--
-- Name: questions questions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk0 FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);


--
-- Name: questions questions_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk1 FOREIGN KEY (asker_id) REFERENCES public.users(user_id);


--
-- Name: questions questions_fk2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk2 FOREIGN KEY (answerer_id) REFERENCES public.users(user_id);


--
-- Name: session_series session_series_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series
    ADD CONSTRAINT session_series_fk0 FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- Name: session_series_tas session_series_tas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series_tas
    ADD CONSTRAINT session_series_tas_fk0 FOREIGN KEY (session_series_id) REFERENCES public.session_series(session_series_id);


--
-- Name: session_series_tas session_series_tas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series_tas
    ADD CONSTRAINT session_series_tas_fk1 FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: session_tas session_tas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_tas
    ADD CONSTRAINT session_tas_fk0 FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);


--
-- Name: session_tas session_tas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_tas
    ADD CONSTRAINT session_tas_fk1 FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: sessions sessions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_fk0 FOREIGN KEY (session_series_id) REFERENCES public.session_series(session_series_id);


--
-- Name: tag_relations tag_relations_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_relations
    ADD CONSTRAINT tag_relations_fk0 FOREIGN KEY (parent_id) REFERENCES public.tags(tag_id);


--
-- Name: tag_relations tag_relations_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_relations
    ADD CONSTRAINT tag_relations_fk1 FOREIGN KEY (child_id) REFERENCES public.tags(tag_id);


--
-- Name: tags tags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_fk0 FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- PostgreSQL database dump complete
--

