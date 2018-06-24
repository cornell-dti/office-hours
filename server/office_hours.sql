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


--
-- Name: jwt_token; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jwt_token AS (
	user_id integer
);


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    content text NOT NULL,
    time_entered timestamp without time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    time_addressed timestamp without time zone,
    session_id integer NOT NULL,
    asker_id integer NOT NULL,
    answerer_id integer
);


--
-- Name: api_add_question(text, text, integer, integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_add_question(_content text, _status text, _session_id integer, _asker_id integer, _tags integer[]) RETURNS SETOF public.questions
    LANGUAGE plpgsql
    AS $$
DECLARE
inserted_question integer;
tag integer;
BEGIN
	INSERT INTO questions(content, status, session_id, asker_id)
	values (_content, _status, _session_id, _asker_id) returning question_id INTO inserted_question;
	FOREACH tag in ARRAY _tags
	LOOP
		INSERT INTO question_tags(question_id, tag_id) VALUES (inserted_question, tag);
	END LOOP;
	RETURN QUERY select * from questions where question_id = inserted_question;
END
$$;


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
-- Name: api_create_series(timestamp without time zone, timestamp without time zone, text, text, integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_create_series(_start_time timestamp without time zone, _end_time timestamp without time zone, _building text, _room text, _course_id integer, _tas integer[]) RETURNS SETOF public.session_series
    LANGUAGE plpgsql
    AS $$

declare

series_id integer;

ta integer;

begin

	insert into session_series (start_time, end_time, building, room, course_id)

		values (_start_time, _end_time, _building, _room, _course_id) returning session_series_id into series_id;

	perform internal_create_sessions_from_series(series_id);

	foreach ta in array _tas loop

		insert into session_series_tas(session_series_id, user_id)

		values (series_id, ta);

	end loop;

	perform internal_sync_series_sessions(series_id);

	return query (select * from session_series where session_series_id = series_id);

end

 $$;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    session_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    building text NOT NULL,
    room text NOT NULL,
    session_series_id integer,
    course_id integer NOT NULL
);


--
-- Name: api_create_session(timestamp without time zone, timestamp without time zone, text, text, integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_create_session(_start_time timestamp without time zone, _end_time timestamp without time zone, _building text, _room text, _course_id integer, _tas integer[]) RETURNS SETOF public.sessions
    LANGUAGE plpgsql
    AS $$

declare

_session_id integer;

ta integer;

begin
	if (_end_time > NOW()) then

		insert into sessions (start_time, end_time, building, room, course_id, session_series_id)

			values (_start_time, _end_time, _building, _room, _course_id, NULL) returning session_id into _session_id;

		foreach ta in array _tas loop

			insert into session_tas(session_id, user_id)

			values (_session_id, ta);

		end loop;

		return query (select * from sessions where session_id = _session_id);
	else
		raise exception 'Cannot create a session that has already ended!';
	end if;

end

 $$;


--
-- Name: api_delete_series(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_delete_series(_series_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
begin
delete from session_tas where session_id in 
	(select session_id from sessions where session_series_id = _series_id and start_time > now());
DELETE FROM sessions WHERE session_series_id = _series_id AND start_time > now();
DELETE FROM session_series_tas WHERE session_series_id = _series_id;
UPDATE sessions
SET session_series_id = NULL WHERE session_series_id = _series_id;
delete from session_series where session_series_id = _series_id;
end
$$;


--
-- Name: api_delete_session(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_delete_session(_session_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$ 

begin

	if (select start_time from sessions where session_id = _session_id) > NOW() then

		delete from session_tas where session_id = _session_id;

		delete from sessions where session_id = _session_id;

	else

		raise exception 'Cannot delete a session that has already started!';

	end if;

end

 $$;


--
-- Name: api_edit_series(integer, timestamp without time zone, timestamp without time zone, text, text, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_edit_series(_series_id integer, _start_time timestamp without time zone, _end_time timestamp without time zone, _building text, _room text, _tas integer[]) RETURNS SETOF public.session_series
    LANGUAGE plpgsql
    AS $$

declare

ta integer;

begin

	update session_series

	set start_time=_start_time, end_time=_end_time, building=_building, room=_room

	where session_series_id = _series_id;

	delete from session_series_tas where session_series_id=_series_id;

	foreach ta in array _tas loop

		insert into session_series_tas(session_series_id, user_id)

		values (_series_id, ta);

	end loop;

	perform internal_sync_series_sessions(_series_id);

	return query (select * from session_series where session_series_id = _series_id);

end

 $$;


--
-- Name: api_edit_session(integer, timestamp without time zone, timestamp without time zone, text, text, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_edit_session(_session_id integer, _start_time timestamp without time zone, _end_time timestamp without time zone, _building text, _room text, _tas integer[]) RETURNS SETOF public.sessions
    LANGUAGE plpgsql
    AS $$

declare

ta integer;

begin
	if (select end_time from sessions where session_id = _session_id) > NOW() then

		update sessions set (start_time, end_time, building, room, session_series_id) =

			(_start_time, _end_time, _building, _room, NULL) where session_id = _session_id;

		delete from session_tas where session_id = _session_id;

		foreach ta in array _tas loop

			insert into session_tas(session_id, user_id)

			values (_session_id, ta);

		end loop;

		return query (select * from sessions where session_id = _session_id);
	else
		raise exception 'Cannot edit a session that has already ended!';
	end if;

end

 $$;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email text NOT NULL,
    google_id text NOT NULL,
    first_name text,
    last_name text,
    created_at timestamp without time zone DEFAULT now(),
    last_activity_at timestamp without time zone DEFAULT now(),
    photo_url text
);


--
-- Name: api_find_or_create_user(text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_find_or_create_user(_email text, _google_id text, _first_name text, _last_name text, _photo_url text) RETURNS SETOF public.users
    LANGUAGE plpgsql
    AS $$ 

declare

_user_id integer;

begin

	if ((select count(*) from users where google_id = _google_id) > 0) then

		select user_id into _user_id from users where google_id = _google_id;

	else

		insert into users (email, google_id, first_name, last_name, photo_url)

		values (_email, _google_id, _first_name, _last_name, _photo_url)

		returning user_id into _user_id;

	end if;

	return query select * from users where user_id = _user_id;

end

 $$;


--
-- Name: api_get_current_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_get_current_user() RETURNS SETOF public.users
    LANGUAGE sql STABLE
    AS $$

select * from users where user_id = (current_setting('jwt.claims.userId', true)::integer);

$$;


--
-- Name: api_get_sessions(integer, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_get_sessions(_course_id integer, _begin_time timestamp without time zone, _end_time timestamp without time zone) RETURNS SETOF public.sessions
    LANGUAGE sql STABLE
    AS $$
select * from sessions where start_time >= _begin_time AND start_time < _end_time AND course_id = _course_id ORDER BY start_time ASC;
$$;


--
-- Name: internal_create_sessions_from_series(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_create_sessions_from_series(_series_id integer) RETURNS SETOF public.sessions
    LANGUAGE plpgsql
    AS $$
declare
course integer;
building text;
room text;
start_date_week timestamp without time zone;
start_date timestamp without time zone;
end_date_week timestamp without time zone;
end_date timestamp without time zone;
cur_date timestamp without time zone;
session_start_time timestamp without time zone;
session_end_time timestamp without time zone;
session_start_offset interval;
session_end_offset interval;
begin
IF (SELECT COUNT(*) FROM sessions where session_series_id = _series_id) > 0 THEN
    RAISE EXCEPTION 'Sessions with this series_id already exist!';
END IF;
course := (SELECT course_id FROM session_series WHERE session_series_id = _series_id);
start_date_week := date_trunc('week', (SELECT courses.start_date from courses WHERE course_id = course));
start_date := date_trunc('day', (SELECT courses.start_date from courses WHERE course_id = course));
end_date_week := date_trunc('week', (SELECT courses.end_date from courses WHERE course_id = course));
end_date := date_trunc('day', (SELECT courses.end_date from courses WHERE course_id = course));
SELECT session_series.start_time, session_series.end_time, session_series.building, session_series.room
    INTO session_start_time, session_end_time, building, room
    FROM session_series WHERE session_series_id = _series_id;
session_start_offset := session_start_time - date_trunc('week', session_start_time);
session_end_offset := session_end_time - date_trunc('week', session_end_time) ;
cur_date := start_date_week;
while cur_date <= end_date_week loop
	if ((cur_date + session_end_offset) > NOW()) and ((cur_date + session_start_offset) >= start_date)
		and ((cur_date + session_start_offset) <= (end_date + interval '1 day')) then
		INSERT INTO sessions(start_time, end_time, building, room, session_series_id, course_id)
		values
		(cur_date + session_start_offset, cur_date + session_end_offset, building, room, _series_id, course);
    end if;
	cur_date := cur_date + interval '1 week';
END LOOP;
RETURN QUERY (SELECT * FROM sessions where session_series_id = _series_id);
END
$$;


--
-- Name: internal_sync_series_sessions(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_sync_series_sessions(_series_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$ 

declare

_start_time timestamp without time zone;

_end_time timestamp without time zone;

_building text;

_room text;

_course_id integer;

session_row sessions%rowtype;

ta_row session_series_tas%rowtype;
session_start_offset interval;
session_end_offset interval;

begin

	select session_series.start_time, session_series.end_time, session_series.building, session_series.room, session_series.course_id

	into _start_time, _end_time, _building, _room, _course_id

	from session_series

	where session_series_id = _series_id;

	session_start_offset := _start_time - date_trunc('week', _start_time);
	session_end_offset := _end_time - date_trunc('week', _end_time);


	for session_row in

		select * from sessions where session_series_id = _series_id and end_time > now()

	loop

		update sessions

		set start_time=date_trunc('week', sessions.start_time) + session_start_offset,
			end_time=date_trunc('week', sessions.end_time) + session_end_offset,
			building=_building, room=_room, course_id=_course_id

		where session_id = session_row.session_id;

	

		delete from session_tas where session_id = session_row.session_id;

		for ta_row in

			select * from session_series_tas where session_series_id = _series_id

		loop

			insert into session_tas(session_id, user_id) values (session_row.session_id, ta_row.user_id);

		end loop;

	end loop;

end

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
1	CS 1380	Data Science For All	SU18	2018-06-28	2018-08-13
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.question_tags (question_id, tag_id) FROM stdin;
9	1
9	9
10	1
10	8
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions (question_id, content, time_entered, status, time_addressed, session_id, asker_id, answerer_id) FROM stdin;
9	Stuck on A1 Q2	2018-06-22 00:44:40.244337	unresolved	\N	236	2	\N
10	Q1 - am I on the right track?	2018-06-22 00:46:56.821684	unresolved	\N	236	4	\N
\.


--
-- Data for Name: session_series; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_series (session_series_id, start_time, end_time, building, room, course_id) FROM stdin;
18	2018-06-11 11:00:00	2018-06-11 12:00:00	Gates	G17	1
19	2018-06-11 13:30:00	2018-06-11 14:45:00	Gates	G11	1
20	2018-06-12 17:30:00	2018-06-11 19:30:00	Rhodes	402	1
21	2018-06-13 10:30:00	2018-06-13 11:15:00	Surge A	101	1
22	2018-06-14 09:00:00	2018-06-14 10:00:00	Gates	311	1
\.


--
-- Data for Name: session_series_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_series_tas (session_series_id, user_id) FROM stdin;
18	8
19	1
20	3
21	6
22	8
\.


--
-- Data for Name: session_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_tas (session_id, user_id) FROM stdin;
236	8
237	8
238	8
239	8
240	8
241	8
242	8
243	1
244	1
245	1
246	1
247	1
248	1
249	1
250	3
251	3
252	3
253	3
254	3
255	3
256	6
257	6
258	6
259	6
260	6
261	6
262	8
263	8
264	8
265	8
266	8
267	8
268	8
269	3
270	3
271	1
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (session_id, start_time, end_time, building, room, session_series_id, course_id) FROM stdin;
250	2018-07-03 17:30:00	2018-07-02 19:30:00	Rhodes	402	20	1
251	2018-07-10 17:30:00	2018-07-09 19:30:00	Rhodes	402	20	1
252	2018-07-17 17:30:00	2018-07-16 19:30:00	Rhodes	402	20	1
253	2018-07-24 17:30:00	2018-07-23 19:30:00	Rhodes	402	20	1
254	2018-07-31 17:30:00	2018-07-30 19:30:00	Rhodes	402	20	1
255	2018-08-07 17:30:00	2018-08-06 19:30:00	Rhodes	402	20	1
256	2018-07-04 10:30:00	2018-07-04 11:15:00	Surge A	101	21	1
257	2018-07-11 10:30:00	2018-07-11 11:15:00	Surge A	101	21	1
258	2018-07-18 10:30:00	2018-07-18 11:15:00	Surge A	101	21	1
259	2018-07-25 10:30:00	2018-07-25 11:15:00	Surge A	101	21	1
260	2018-08-01 10:30:00	2018-08-01 11:15:00	Surge A	101	21	1
261	2018-08-08 10:30:00	2018-08-08 11:15:00	Surge A	101	21	1
262	2018-06-28 09:00:00	2018-06-28 10:00:00	Gates	311	22	1
263	2018-07-05 09:00:00	2018-07-05 10:00:00	Gates	311	22	1
264	2018-07-12 09:00:00	2018-07-12 10:00:00	Gates	311	22	1
265	2018-07-19 09:00:00	2018-07-19 10:00:00	Gates	311	22	1
266	2018-07-26 09:00:00	2018-07-26 10:00:00	Gates	311	22	1
267	2018-08-02 09:00:00	2018-08-02 10:00:00	Gates	311	22	1
268	2018-08-09 09:00:00	2018-08-09 10:00:00	Gates	311	22	1
269	2018-07-01 12:00:00	2018-07-01 13:00:00	Upson	B60	\N	1
236	2018-07-02 11:00:00	2018-07-02 12:00:00	Gates	G17	18	1
237	2018-07-09 11:00:00	2018-07-09 12:00:00	Gates	G17	18	1
270	2018-07-08 14:00:00	2018-07-08 15:00:00	Upson	B60	\N	1
238	2018-07-16 11:00:00	2018-07-16 12:00:00	Gates	G17	18	1
239	2018-07-23 11:00:00	2018-07-23 12:00:00	Gates	G17	18	1
240	2018-07-30 11:00:00	2018-07-30 12:00:00	Gates	G17	18	1
241	2018-08-06 11:00:00	2018-08-06 12:00:00	Gates	G17	18	1
242	2018-08-13 11:00:00	2018-08-13 12:00:00	Gates	G17	18	1
271	2018-07-15 16:00:00	2018-07-15 17:00:00	Upson	B60	\N	1
243	2018-07-02 13:30:00	2018-07-02 14:45:00	Gates	G11	19	1
244	2018-07-09 13:30:00	2018-07-09 14:45:00	Gates	G11	19	1
245	2018-07-16 13:30:00	2018-07-16 14:45:00	Gates	G11	19	1
246	2018-07-23 13:30:00	2018-07-23 14:45:00	Gates	G11	19	1
247	2018-07-30 13:30:00	2018-07-30 14:45:00	Gates	G11	19	1
248	2018-08-06 13:30:00	2018-08-06 14:45:00	Gates	G11	19	1
249	2018-08-13 13:30:00	2018-08-13 14:45:00	Gates	G11	19	1
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

COPY public.users (user_id, email, google_id, first_name, last_name, created_at, last_activity_at, photo_url) FROM stdin;
1	cv231@cornell.edu	115064340704113209584	Corey	Valdez	2018-03-25 03:07:23.485	2018-03-25 03:07:26.391	https://randomuser.me/api/portraits/men/46.jpg
2	ejs928@cornell.edu	139064340704113209582	Edgar	Stewart	2018-03-25 03:08:05.668	2018-03-25 03:08:08.294	https://randomuser.me/api/portraits/men/7.jpg
3	asm2292@cornell.edu	115064340704118374059	Ada	Morton	2018-03-25 03:08:51.563	2018-03-25 03:08:54.084	https://randomuser.me/api/portraits/women/8.jpg
4	cr848@cornell.edu	215064340704113209584	Caroline	Robinson	2018-03-25 03:09:25.563	2018-03-25 03:09:28.525	https://randomuser.me/api/portraits/women/59.jpg
5	ca449@cornell.edu	115064340704113209332	Christopher	Arnold	2018-03-25 03:10:28.166	2018-03-25 03:10:32.518	\N
6	zz527@cornell.edu	115064340704113209009	Zechen	Zhang	2018-03-25 03:11:20.394	2018-03-25 03:11:22.765	\N
7	sjw748@cornell.edu	115064340704113209877	Susan	Wilson	2018-03-25 03:12:45.328	2018-03-25 03:12:47.826	https://randomuser.me/api/portraits/women/81.jpg
8	clarkson@cs.cornell.edu	115064340704113209999	Michael	Clarkson	2018-03-25 03:13:26.996	2018-03-25 03:13:29.4	https://randomuser.me/api/portraits/men/20.jpg
14	ks939@cornell.edu	114961512147775594594	\N	\N	2018-06-22 14:35:32.112481	2018-06-22 14:35:32.112481	https://lh5.googleusercontent.com/-5atJCQlqmEM/AAAAAAAAAAI/AAAAAAAARN8/-TM5RNTPV0w/photo.jpg
\.


--
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 1, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 10, true);


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.session_series_session_series_id_seq', 22, true);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_session_id_seq', 271, true);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_tag_id_seq', 35, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 14, true);


--
-- Name: course_users course_users_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_users
    ADD CONSTRAINT course_users_pk PRIMARY KEY (course_id, user_id);


--
-- Name: courses courses_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pk PRIMARY KEY (course_id);


--
-- Name: question_tags question_tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_tags
    ADD CONSTRAINT question_tags_pk PRIMARY KEY (question_id, tag_id);


--
-- Name: questions questions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pk PRIMARY KEY (question_id);


--
-- Name: session_series session_series_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series
    ADD CONSTRAINT session_series_pk PRIMARY KEY (session_series_id);


--
-- Name: session_series_tas session_series_tas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_series_tas
    ADD CONSTRAINT session_series_tas_pk PRIMARY KEY (session_series_id, user_id);


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
-- Name: tag_relations tag_relations_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_relations
    ADD CONSTRAINT tag_relations_pk PRIMARY KEY (parent_id, child_id);


--
-- Name: tags tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pk PRIMARY KEY (tag_id);


--
-- Name: users users_googleid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_googleid_key UNIQUE (google_id);


--
-- Name: users users_netid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_netid_key UNIQUE (email);


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
    ADD CONSTRAINT sessions_fk0 FOREIGN KEY (course_id) REFERENCES public.courses(course_id);


--
-- Name: sessions sessions_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_fk1 FOREIGN KEY (session_series_id) REFERENCES public.session_series(session_series_id);


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

