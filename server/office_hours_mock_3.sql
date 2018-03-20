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
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: course_users; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.course_users (
    course_id integer NOT NULL,
    user_id text NOT NULL,
    status text
);


ALTER TABLE public.course_users OWNER TO chilli;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.courses (
    course_id integer NOT NULL,
    code text,
    name text,
    semester text
);


ALTER TABLE public.courses OWNER TO chilli;

--
-- Name: courses_course_id_seq; Type: SEQUENCE; Schema: public; Owner: chilli
--

CREATE SEQUENCE public.courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.courses_course_id_seq OWNER TO chilli;

--
-- Name: courses_course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chilli
--

ALTER SEQUENCE public.courses_course_id_seq OWNED BY public.courses.course_id;


--
-- Name: question_followers; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.question_followers (
    question_id integer NOT NULL,
    follower text NOT NULL
);


ALTER TABLE public.question_followers OWNER TO chilli;

--
-- Name: question_tags; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.question_tags (
    tag_id integer NOT NULL,
    question_id integer NOT NULL
);


ALTER TABLE public.question_tags OWNER TO chilli;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    value text,
    time_entered timestamp without time zone DEFAULT now(),
    status text,
    time_resolved timestamp without time zone,
    session_id integer,
    student text
);


ALTER TABLE public.questions OWNER TO chilli;

--
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: chilli
--

CREATE SEQUENCE public.questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.questions_question_id_seq OWNER TO chilli;

--
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chilli
--

ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;


--
-- Name: session_tas; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.session_tas (
    session_id integer NOT NULL,
    ta text NOT NULL
);


ALTER TABLE public.session_tas OWNER TO chilli;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.sessions (
    session_id integer NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    location text,
    course_id integer
);


ALTER TABLE public.sessions OWNER TO chilli;

--
-- Name: sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: chilli
--

CREATE SEQUENCE public.sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_session_id_seq OWNER TO chilli;

--
-- Name: sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chilli
--

ALTER SEQUENCE public.sessions_session_id_seq OWNED BY public.sessions.session_id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.tags (
    tag_id integer NOT NULL,
    value text,
    course_id integer
);


ALTER TABLE public.tags OWNER TO chilli;

--
-- Name: tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: chilli
--

CREATE SEQUENCE public.tags_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_tag_id_seq OWNER TO chilli;

--
-- Name: tags_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chilli
--

ALTER SEQUENCE public.tags_tag_id_seq OWNED BY public.tags.tag_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: chilli
--

CREATE TABLE public.users (
    netid text NOT NULL,
    name text
);


ALTER TABLE public.users OWNER TO chilli;

--
-- Name: courses course_id; Type: DEFAULT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.courses ALTER COLUMN course_id SET DEFAULT nextval('public.courses_course_id_seq'::regclass);


--
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- Name: sessions session_id; Type: DEFAULT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.sessions ALTER COLUMN session_id SET DEFAULT nextval('public.sessions_session_id_seq'::regclass);


--
-- Name: tags tag_id; Type: DEFAULT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.tags ALTER COLUMN tag_id SET DEFAULT nextval('public.tags_tag_id_seq'::regclass);


--
-- Data for Name: course_users; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.course_users (course_id, user_id, status) FROM stdin;
2	bLwwT0e3	kDhqROsS
3	8GEG9YeB	X6YQVueI
3	bLwwT0e3	7dAlfNx3
21669083	8GEG9YeB	Ynw20CrV
13109002	tdMwFeFJ	4TdLtRk4
20534210	XX8RTmrh	YZUa1B2m
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.courses (course_id, code, name, semester) FROM stdin;
1	jo7TE4uF	eX2SIEOf	vhnKeAvH
2	ERAWtcyf	O1BaCGXJ	0d34mmiu
3	ibXaUiIG	Z487lYpS	SYxsz6hT
21669083	tT0bVsBg	2BT5sFDc	7VWXU5T4
13109002	bJwEOgFN	9alfqndp	jKtRHg6S
20534210	osEaBmnk	2dktvrsN	Dpzl2Y9L
\.


--
-- Data for Name: question_followers; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.question_followers (question_id, follower) FROM stdin;
6	bLwwT0e3
19746459	tdMwFeFJ
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.question_tags (tag_id, question_id) FROM stdin;
3	6
3	4
2	5
1	13486445
2	19746459
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.questions (question_id, value, time_entered, status, time_resolved, session_id, student) FROM stdin;
15238087	69aaUMKC	2023-12-20 10:36:28	Q8VrlAhE	2025-09-20 07:18:37	1	tdMwFeFJ
13486445	NjZpiXdl	2012-11-04 20:05:01	0tvmpdMZ	2024-05-07 21:21:22	1	bLwwT0e3
19746459	e4EBqU4C	2013-10-25 02:39:20	hfiYnlvT	2021-05-18 15:48:50	3	bLwwT0e3
4	qKyxoLDj	2018-01-09 10:12:01	nGmhbPYX	2022-06-14 14:28:06	9908101	tdMwFeFJ
5	ogwNNzr1	2021-11-07 19:44:35	aanoxwkh	2010-08-19 20:04:31	1	8GEG9YeB
6	0sLEo4Kv	2011-04-11 22:31:50	YiFvu3LT	2010-08-31 12:40:09	12030179	tdMwFeFJ
\.


--
-- Data for Name: session_tas; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.session_tas (session_id, ta) FROM stdin;
1	tdMwFeFJ
2	8GEG9YeB
3	bLwwT0e3
1	8GEG9YeB
12030179	2WdfU2b7
9908101	8GEG9YeB
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.sessions (session_id, start_time, end_time, location, course_id) FROM stdin;
12030179	2016-02-26 16:48:17	2020-09-26 19:55:54	Nbd6rar6	3
15516011	2025-07-13 16:17:52	2024-03-04 16:36:09	khRidsrX	3
9908101	2018-02-13 07:49:37	2013-03-24 07:27:12	XX9jwVYY	1
1	2024-06-17 05:50:09	2014-04-26 04:03:06	CeN4mc4V	3
2	2017-04-25 05:54:50	2012-05-09 10:33:59	0kJXP2Dl	2
3	2014-08-05 01:06:01	2017-05-18 02:00:13	2PZNR4in	2
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.tags (tag_id, value, course_id) FROM stdin;
20231139	KEGNFkCk	1
21386312	JupnSLg8	1
13798164	Sc4Y9GBN	1
1	PuT3IAEt	3
2	dgI8ytQp	21669083
3	CdiRRMr1	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: chilli
--

COPY public.users (netid, name) FROM stdin;
tdMwFeFJ	dVzt6heq
bLwwT0e3	GB2WmYmN
8GEG9YeB	BqBsMKWp
2WdfU2b7	ZaFpP6eB
XX8RTmrh	dkQnFmf4
qq9xJ1hw	lp7LKWbD
\.


--
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chilli
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 3, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chilli
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 6, true);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chilli
--

SELECT pg_catalog.setval('public.sessions_session_id_seq', 3, true);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chilli
--

SELECT pg_catalog.setval('public.tags_tag_id_seq', 3, true);


--
-- Name: course_users course_users_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.course_users
    ADD CONSTRAINT course_users_pkey PRIMARY KEY (course_id, user_id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);


--
-- Name: question_followers question_followers_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.question_followers
    ADD CONSTRAINT question_followers_pkey PRIMARY KEY (question_id, follower);


--
-- Name: question_tags question_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT question_tags_pkey PRIMARY KEY (tag_id, question_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- Name: session_tas session_tas_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.session_tas
    ADD CONSTRAINT session_tas_pkey PRIMARY KEY (session_id, ta);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (session_id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (netid);


--
-- Name: course_users course_users_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.course_users
    ADD CONSTRAINT course_users_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- Name: course_users course_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.course_users
    ADD CONSTRAINT course_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(netid);


--
-- Name: question_followers question_followers_follower_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.question_followers
    ADD CONSTRAINT question_followers_follower_fkey FOREIGN KEY (follower) REFERENCES public.users(netid);


--
-- Name: question_followers question_followers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.question_followers
    ADD CONSTRAINT question_followers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- Name: question_tags question_tags_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT question_tags_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id);


--
-- Name: question_tags question_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT question_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(tag_id);


--
-- Name: questions questions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);


--
-- Name: questions questions_student_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_student_fkey FOREIGN KEY (student) REFERENCES public.users(netid);


--
-- Name: session_tas session_tas_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.session_tas
    ADD CONSTRAINT session_tas_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id);


--
-- Name: session_tas session_tas_ta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.session_tas
    ADD CONSTRAINT session_tas_ta_fkey FOREIGN KEY (ta) REFERENCES public.users(netid);


--
-- Name: sessions sessions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- Name: tags tags_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chilli
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- PostgreSQL database dump complete
--

