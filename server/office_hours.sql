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
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: courseUsers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."courseUsers" (
    "courseId" integer NOT NULL,
    "userId" integer NOT NULL,
    role text NOT NULL
);


ALTER TABLE public."courseUsers" OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    "courseId" integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    semester text NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_courseId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."courses_courseId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."courses_courseId_seq" OWNER TO postgres;

--
-- Name: courses_courseId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."courses_courseId_seq" OWNED BY public.courses."courseId";


--
-- Name: questionTags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."questionTags" (
    "questionId" integer NOT NULL,
    "tagId" integer NOT NULL
);


ALTER TABLE public."questionTags" OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    "questionId" integer NOT NULL,
    content text NOT NULL,
    "timeEntered" timestamp without time zone NOT NULL,
    status text NOT NULL,
    "timeResolved" timestamp without time zone,
    "sessionId" integer NOT NULL,
    "askerId" integer NOT NULL,
    "answererId" integer
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_questionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."questions_questionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."questions_questionId_seq" OWNER TO postgres;

--
-- Name: questions_questionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."questions_questionId_seq" OWNED BY public.questions."questionId";


--
-- Name: sessionSeries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."sessionSeries" (
    "sessionSeriesId" integer NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone NOT NULL,
    location text NOT NULL,
    "courseId" integer NOT NULL
);


ALTER TABLE public."sessionSeries" OWNER TO postgres;

--
-- Name: sessionSeriesTas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."sessionSeriesTas" (
    "sessionSeriesId" integer NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."sessionSeriesTas" OWNER TO postgres;

--
-- Name: sessionSeries_sessionSeriesId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."sessionSeries_sessionSeriesId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."sessionSeries_sessionSeriesId_seq" OWNER TO postgres;

--
-- Name: sessionSeries_sessionSeriesId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."sessionSeries_sessionSeriesId_seq" OWNED BY public."sessionSeries"."sessionSeriesId";


--
-- Name: sessionTas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."sessionTas" (
    "sessionId" integer NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."sessionTas" OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    "sessionId" integer NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone NOT NULL,
    location text,
    "sessionSeriesId" integer
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: sessions_sessionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."sessions_sessionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."sessions_sessionId_seq" OWNER TO postgres;

--
-- Name: sessions_sessionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."sessions_sessionId_seq" OWNED BY public.sessions."sessionId";


--
-- Name: tagRelations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."tagRelations" (
    "parentId" integer NOT NULL,
    "childId" integer NOT NULL
);


ALTER TABLE public."tagRelations" OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    "tagId" integer NOT NULL,
    name text NOT NULL,
    "courseId" integer NOT NULL,
    level integer NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_tagId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."tags_tagId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."tags_tagId_seq" OWNER TO postgres;

--
-- Name: tags_tagId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."tags_tagId_seq" OWNED BY public.tags."tagId";


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    "userId" integer NOT NULL,
    "netId" text NOT NULL,
    "googleId" text NOT NULL,
    "firstName" text,
    "lastName" text,
    "createdAt" timestamp without time zone,
    "lastActivityAt" timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_userId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."users_userId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."users_userId_seq" OWNER TO postgres;

--
-- Name: users_userId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."users_userId_seq" OWNED BY public.users."userId";


--
-- Name: courses courseId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN "courseId" SET DEFAULT nextval('public."courses_courseId_seq"'::regclass);


--
-- Name: questions questionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN "questionId" SET DEFAULT nextval('public."questions_questionId_seq"'::regclass);


--
-- Name: sessionSeries sessionSeriesId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionSeries" ALTER COLUMN "sessionSeriesId" SET DEFAULT nextval('public."sessionSeries_sessionSeriesId_seq"'::regclass);


--
-- Name: sessions sessionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN "sessionId" SET DEFAULT nextval('public."sessions_sessionId_seq"'::regclass);


--
-- Name: tags tagId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN "tagId" SET DEFAULT nextval('public."tags_tagId_seq"'::regclass);


--
-- Name: users userId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN "userId" SET DEFAULT nextval('public."users_userId_seq"'::regclass);


--
-- Data for Name: courseUsers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."courseUsers" ("courseId", "userId", role) FROM stdin;
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
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses ("courseId", code, name, semester, "startDate", "endDate") FROM stdin;
1	CS 1380	Data Science For All	SP18	2018-01-24	2018-05-13
\.


--
-- Data for Name: questionTags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."questionTags" ("questionId", "tagId") FROM stdin;
1	1
1	9
1	31
2	2
2	13
2	32
2	33
3	5
3	21
3	29
4	7
4	25
4	35
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions ("questionId", content, "timeEntered", status, "timeResolved", "sessionId", "askerId", "answererId") FROM stdin;
2	Dataset parsing for Q2	2018-03-26 10:01:33	unresolved	\N	1	4	\N
3	Clarifying statistics concept from prelim	2018-03-26 10:03:12	unresolved	\N	1	7	\N
1	How do you implement recursion in Question 2?	2018-03-26 09:47:33	resolved	2018-03-26 10:06:49	1	2	1
4	Question about course grading	2018-03-26 10:07:39	unresolved	\N	1	5	\N
\.


--
-- Data for Name: sessionSeries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."sessionSeries" ("sessionSeriesId", "startTime", "endTime", location, "courseId") FROM stdin;
1	2018-03-26 10:00:00	2018-03-26 11:00:00	Gates G21	1
2	2018-03-26 12:20:00	2018-03-26 13:10:00	Academic Surge A Office 101	1
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Academic Surge A Office 102	1
4	2018-03-26 19:00:00	2018-03-26 20:15:00	Gates G17	1
\.


--
-- Data for Name: sessionSeriesTas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."sessionSeriesTas" ("sessionSeriesId", "userId") FROM stdin;
1	1
2	8
3	3
4	6
\.


--
-- Data for Name: sessionTas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."sessionTas" ("sessionId", "userId") FROM stdin;
7	3
7	6
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions ("sessionId", "startTime", "endTime", location, "sessionSeriesId") FROM stdin;
1	2018-03-26 10:00:00	2018-03-26 11:00:00	\N	1
2	2018-03-26 12:20:00	2018-03-26 13:10:00	\N	2
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Rhodes 412	3
4	2018-03-26 19:00:00	2018-03-26 20:30:00		4
5	2018-04-02 10:00:00	2018-04-02 11:00:00		1
6	2018-04-02 12:20:00	2018-04-02 13:10:00	Gates G11	2
7	2018-04-02 19:00:00	2018-04-02 20:30:00		4
\.


--
-- Data for Name: tagRelations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."tagRelations" ("parentId", "childId") FROM stdin;
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
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags ("tagId", name, "courseId", level) FROM stdin;
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
28	Causality	1	3
29	Probability	1	3
30	Inference	1	3
31	Recursion	1	3
32	Classification	1	3
33	Clustering	1	3
34	Visualization	1	3
35	Other	1	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users ("userId", "netId", "googleId", "firstName", "lastName", "createdAt", "lastActivityAt") FROM stdin;
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
-- Name: courses_courseId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."courses_courseId_seq"', 1, true);


--
-- Name: questions_questionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."questions_questionId_seq"', 4, true);


--
-- Name: sessionSeries_sessionSeriesId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."sessionSeries_sessionSeriesId_seq"', 4, true);


--
-- Name: sessions_sessionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."sessions_sessionId_seq"', 7, true);


--
-- Name: tags_tagId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."tags_tagId_seq"', 35, true);


--
-- Name: users_userId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."users_userId_seq"', 8, true);


--
-- Name: courses courses_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pk PRIMARY KEY ("courseId");


--
-- Name: courseUsers courseusers_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."courseUsers"
    ADD CONSTRAINT courseusers_pk PRIMARY KEY ("courseId", "userId");


--
-- Name: questions questions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pk PRIMARY KEY ("questionId");


--
-- Name: questionTags questiontags_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."questionTags"
    ADD CONSTRAINT questiontags_pk PRIMARY KEY ("questionId", "tagId");


--
-- Name: sessions sessions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pk PRIMARY KEY ("sessionId");


--
-- Name: sessionSeries sessionseries_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionSeries"
    ADD CONSTRAINT sessionseries_pk PRIMARY KEY ("sessionSeriesId");


--
-- Name: sessionSeriesTas sessionseriestas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionSeriesTas"
    ADD CONSTRAINT sessionseriestas_pk PRIMARY KEY ("sessionSeriesId", "userId");


--
-- Name: sessionTas sessiontas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionTas"
    ADD CONSTRAINT sessiontas_pk PRIMARY KEY ("sessionId", "userId");


--
-- Name: tagRelations tagrelations_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."tagRelations"
    ADD CONSTRAINT tagrelations_pk PRIMARY KEY ("parentId", "childId");


--
-- Name: tags tags_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pk PRIMARY KEY ("tagId");


--
-- Name: users users_googleId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_googleId_key" UNIQUE ("googleId");


--
-- Name: users users_netId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_netId_key" UNIQUE ("netId");


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY ("userId");


--
-- Name: courseUsers courseUsers_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."courseUsers"
    ADD CONSTRAINT "courseUsers_fk0" FOREIGN KEY ("courseId") REFERENCES public.courses("courseId");


--
-- Name: courseUsers courseUsers_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."courseUsers"
    ADD CONSTRAINT "courseUsers_fk1" FOREIGN KEY ("userId") REFERENCES public.users("userId");


--
-- Name: questionTags questionTags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."questionTags"
    ADD CONSTRAINT "questionTags_fk0" FOREIGN KEY ("questionId") REFERENCES public.questions("questionId");


--
-- Name: questionTags questionTags_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."questionTags"
    ADD CONSTRAINT "questionTags_fk1" FOREIGN KEY ("tagId") REFERENCES public.tags("tagId");


--
-- Name: questions questions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk0 FOREIGN KEY ("sessionId") REFERENCES public.sessions("sessionId");


--
-- Name: questions questions_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk1 FOREIGN KEY ("askerId") REFERENCES public.users("userId");


--
-- Name: questions questions_fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk2 FOREIGN KEY ("answererId") REFERENCES public.users("userId");


--
-- Name: sessionSeriesTas sessionSeriesTas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionSeriesTas"
    ADD CONSTRAINT "sessionSeriesTas_fk0" FOREIGN KEY ("sessionSeriesId") REFERENCES public."sessionSeries"("sessionSeriesId");


--
-- Name: sessionSeriesTas sessionSeriesTas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionSeriesTas"
    ADD CONSTRAINT "sessionSeriesTas_fk1" FOREIGN KEY ("userId") REFERENCES public.users("userId");


--
-- Name: sessionSeries sessionSeries_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionSeries"
    ADD CONSTRAINT "sessionSeries_fk0" FOREIGN KEY ("courseId") REFERENCES public.courses("courseId");


--
-- Name: sessionTas sessionTas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionTas"
    ADD CONSTRAINT "sessionTas_fk0" FOREIGN KEY ("sessionId") REFERENCES public.sessions("sessionId");


--
-- Name: sessionTas sessionTas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."sessionTas"
    ADD CONSTRAINT "sessionTas_fk1" FOREIGN KEY ("userId") REFERENCES public.users("userId");


--
-- Name: sessions sessions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_fk0 FOREIGN KEY ("sessionSeriesId") REFERENCES public."sessionSeries"("sessionSeriesId");


--
-- Name: tagRelations tagRelations_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."tagRelations"
    ADD CONSTRAINT "tagRelations_fk0" FOREIGN KEY ("parentId") REFERENCES public.tags("tagId");


--
-- Name: tagRelations tagRelations_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."tagRelations"
    ADD CONSTRAINT "tagRelations_fk1" FOREIGN KEY ("childId") REFERENCES public.tags("tagId");


--
-- Name: tags tags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_fk0 FOREIGN KEY ("courseId") REFERENCES public.courses("courseId");


--
-- PostgreSQL database dump complete
--

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
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


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
-- Name: courseUsers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."courseUsers" (
    "courseId" integer NOT NULL,
    "userId" integer NOT NULL,
    role text NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    "courseId" integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    semester text NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL
);


--
-- Name: courses_courseId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."courses_courseId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_courseId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."courses_courseId_seq" OWNED BY public.courses."courseId";


--
-- Name: questionTags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."questionTags" (
    "questionId" integer NOT NULL,
    "tagId" integer NOT NULL
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    "questionId" integer NOT NULL,
    content text NOT NULL,
    "timeEntered" timestamp without time zone NOT NULL,
    status text NOT NULL,
    "timeResolved" timestamp without time zone,
    "sessionId" integer NOT NULL,
    "askerId" integer NOT NULL,
    "answererId" integer
);


--
-- Name: questions_questionId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."questions_questionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_questionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."questions_questionId_seq" OWNED BY public.questions."questionId";


--
-- Name: sessionSeries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."sessionSeries" (
    "sessionSeriesId" integer NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone NOT NULL,
    location text NOT NULL,
    "courseId" integer NOT NULL
);


--
-- Name: sessionSeriesTas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."sessionSeriesTas" (
    "sessionSeriesId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: sessionSeries_sessionSeriesId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."sessionSeries_sessionSeriesId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessionSeries_sessionSeriesId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."sessionSeries_sessionSeriesId_seq" OWNED BY public."sessionSeries"."sessionSeriesId";


--
-- Name: sessionTas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."sessionTas" (
    "sessionId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    "sessionId" integer NOT NULL,
    "startTime" timestamp without time zone NOT NULL,
    "endTime" timestamp without time zone NOT NULL,
    location text,
    "sessionSeriesId" integer
);


--
-- Name: sessions_sessionId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."sessions_sessionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_sessionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."sessions_sessionId_seq" OWNED BY public.sessions."sessionId";


--
-- Name: tagRelations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tagRelations" (
    "parentId" integer NOT NULL,
    "childId" integer NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    "tagId" integer NOT NULL,
    name text NOT NULL,
    "courseId" integer NOT NULL,
    level integer NOT NULL
);


--
-- Name: tags_tagId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tags_tagId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_tagId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tags_tagId_seq" OWNED BY public.tags."tagId";


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    "userId" integer NOT NULL,
    "netId" text NOT NULL,
    "googleId" text NOT NULL,
    "firstName" text,
    "lastName" text,
    "createdAt" timestamp without time zone,
    "lastActivityAt" timestamp without time zone
);


--
-- Name: users_userId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."users_userId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_userId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."users_userId_seq" OWNED BY public.users."userId";


--
-- Name: courses courseId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN "courseId" SET DEFAULT nextval('public."courses_courseId_seq"'::regclass);


--
-- Name: questions questionId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN "questionId" SET DEFAULT nextval('public."questions_questionId_seq"'::regclass);


--
-- Name: sessionSeries sessionSeriesId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionSeries" ALTER COLUMN "sessionSeriesId" SET DEFAULT nextval('public."sessionSeries_sessionSeriesId_seq"'::regclass);


--
-- Name: sessions sessionId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN "sessionId" SET DEFAULT nextval('public."sessions_sessionId_seq"'::regclass);


--
-- Name: tags tagId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN "tagId" SET DEFAULT nextval('public."tags_tagId_seq"'::regclass);


--
-- Name: users userId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN "userId" SET DEFAULT nextval('public."users_userId_seq"'::regclass);


--
-- Data for Name: courseUsers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."courseUsers" ("courseId", "userId", role) FROM stdin;
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

COPY public.courses ("courseId", code, name, semester, "startDate", "endDate") FROM stdin;
1	CS 1380	Data Science For All	SP18	2018-01-24	2018-05-13
\.


--
-- Data for Name: questionTags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."questionTags" ("questionId", "tagId") FROM stdin;
1	1
1	9
1	31
2	2
2	13
2	32
2	33
3	5
3	21
3	29
4	7
4	25
4	35
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions ("questionId", content, "timeEntered", status, "timeResolved", "sessionId", "askerId", "answererId") FROM stdin;
2	Dataset parsing for Q2	2018-03-26 10:01:33	unresolved	\N	1	4	\N
3	Clarifying statistics concept from prelim	2018-03-26 10:03:12	unresolved	\N	1	7	\N
1	How do you implement recursion in Question 2?	2018-03-26 09:47:33	resolved	2018-03-26 10:06:49	1	2	1
4	Question about course grading	2018-03-26 10:07:39	unresolved	\N	1	5	\N
\.


--
-- Data for Name: sessionSeries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."sessionSeries" ("sessionSeriesId", "startTime", "endTime", location, "courseId") FROM stdin;
1	2018-03-26 10:00:00	2018-03-26 11:00:00	Gates G21	1
2	2018-03-26 12:20:00	2018-03-26 13:10:00	Academic Surge A Office 101	1
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Academic Surge A Office 102	1
4	2018-03-26 19:00:00	2018-03-26 20:15:00	Gates G17	1
\.


--
-- Data for Name: sessionSeriesTas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."sessionSeriesTas" ("sessionSeriesId", "userId") FROM stdin;
1	1
2	8
3	3
4	6
\.


--
-- Data for Name: sessionTas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."sessionTas" ("sessionId", "userId") FROM stdin;
7	3
7	6
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions ("sessionId", "startTime", "endTime", location, "sessionSeriesId") FROM stdin;
1	2018-03-26 10:00:00	2018-03-26 11:00:00	\N	1
2	2018-03-26 12:20:00	2018-03-26 13:10:00	\N	2
3	2018-03-26 13:00:00	2018-03-26 14:30:00	Rhodes 412	3
4	2018-03-26 19:00:00	2018-03-26 20:30:00		4
5	2018-04-02 10:00:00	2018-04-02 11:00:00		1
6	2018-04-02 12:20:00	2018-04-02 13:10:00	Gates G11	2
7	2018-04-02 19:00:00	2018-04-02 20:30:00		4
\.


--
-- Data for Name: tagRelations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."tagRelations" ("parentId", "childId") FROM stdin;
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

COPY public.tags ("tagId", name, "courseId", level) FROM stdin;
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
28	Causality	1	3
29	Probability	1	3
30	Inference	1	3
31	Recursion	1	3
32	Classification	1	3
33	Clustering	1	3
34	Visualization	1	3
35	Other	1	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users ("userId", "netId", "googleId", "firstName", "lastName", "createdAt", "lastActivityAt") FROM stdin;
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
-- Name: courses_courseId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."courses_courseId_seq"', 1, true);


--
-- Name: questions_questionId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."questions_questionId_seq"', 4, true);


--
-- Name: sessionSeries_sessionSeriesId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."sessionSeries_sessionSeriesId_seq"', 4, true);


--
-- Name: sessions_sessionId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."sessions_sessionId_seq"', 7, true);


--
-- Name: tags_tagId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."tags_tagId_seq"', 35, true);


--
-- Name: users_userId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."users_userId_seq"', 8, true);


--
-- Name: courses courses_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pk PRIMARY KEY ("courseId");


--
-- Name: courseUsers courseusers_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."courseUsers"
    ADD CONSTRAINT courseusers_pk PRIMARY KEY ("courseId", "userId");


--
-- Name: questions questions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pk PRIMARY KEY ("questionId");


--
-- Name: questionTags questiontags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."questionTags"
    ADD CONSTRAINT questiontags_pk PRIMARY KEY ("questionId", "tagId");


--
-- Name: sessions sessions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pk PRIMARY KEY ("sessionId");


--
-- Name: sessionSeries sessionseries_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionSeries"
    ADD CONSTRAINT sessionseries_pk PRIMARY KEY ("sessionSeriesId");


--
-- Name: sessionSeriesTas sessionseriestas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionSeriesTas"
    ADD CONSTRAINT sessionseriestas_pk PRIMARY KEY ("sessionSeriesId", "userId");


--
-- Name: sessionTas sessiontas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionTas"
    ADD CONSTRAINT sessiontas_pk PRIMARY KEY ("sessionId", "userId");


--
-- Name: tagRelations tagrelations_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tagRelations"
    ADD CONSTRAINT tagrelations_pk PRIMARY KEY ("parentId", "childId");


--
-- Name: tags tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pk PRIMARY KEY ("tagId");


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
    ADD CONSTRAINT users_pk PRIMARY KEY ("userId");


--
-- Name: courseUsers courseUsers_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."courseUsers"
    ADD CONSTRAINT "courseUsers_fk0" FOREIGN KEY ("courseId") REFERENCES public.courses("courseId");


--
-- Name: courseUsers courseUsers_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."courseUsers"
    ADD CONSTRAINT "courseUsers_fk1" FOREIGN KEY ("userId") REFERENCES public.users("userId");


--
-- Name: questionTags questionTags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."questionTags"
    ADD CONSTRAINT "questionTags_fk0" FOREIGN KEY ("questionId") REFERENCES public.questions("questionId");


--
-- Name: questionTags questionTags_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."questionTags"
    ADD CONSTRAINT "questionTags_fk1" FOREIGN KEY ("tagId") REFERENCES public.tags("tagId");


--
-- Name: questions questions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk0 FOREIGN KEY ("sessionId") REFERENCES public.sessions("sessionId");


--
-- Name: questions questions_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk1 FOREIGN KEY ("askerId") REFERENCES public.users("userId");


--
-- Name: questions questions_fk2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_fk2 FOREIGN KEY ("answererId") REFERENCES public.users("userId");


--
-- Name: sessionSeriesTas sessionSeriesTas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionSeriesTas"
    ADD CONSTRAINT "sessionSeriesTas_fk0" FOREIGN KEY ("sessionSeriesId") REFERENCES public."sessionSeries"("sessionSeriesId");


--
-- Name: sessionSeriesTas sessionSeriesTas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionSeriesTas"
    ADD CONSTRAINT "sessionSeriesTas_fk1" FOREIGN KEY ("userId") REFERENCES public.users("userId");


--
-- Name: sessionSeries sessionSeries_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionSeries"
    ADD CONSTRAINT "sessionSeries_fk0" FOREIGN KEY ("courseId") REFERENCES public.courses("courseId");


--
-- Name: sessionTas sessionTas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionTas"
    ADD CONSTRAINT "sessionTas_fk0" FOREIGN KEY ("sessionId") REFERENCES public.sessions("sessionId");


--
-- Name: sessionTas sessionTas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sessionTas"
    ADD CONSTRAINT "sessionTas_fk1" FOREIGN KEY ("userId") REFERENCES public.users("userId");


--
-- Name: sessions sessions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_fk0 FOREIGN KEY ("sessionSeriesId") REFERENCES public."sessionSeries"("sessionSeriesId");


--
-- Name: tagRelations tagRelations_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tagRelations"
    ADD CONSTRAINT "tagRelations_fk0" FOREIGN KEY ("parentId") REFERENCES public.tags("tagId");


--
-- Name: tagRelations tagRelations_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tagRelations"
    ADD CONSTRAINT "tagRelations_fk1" FOREIGN KEY ("childId") REFERENCES public.tags("tagId");


--
-- Name: tags tags_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_fk0 FOREIGN KEY ("courseId") REFERENCES public.courses("courseId");


--
-- PostgreSQL database dump complete
--

