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
    time_entered timestamp with time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    time_addressed timestamp with time zone,
    session_id integer NOT NULL,
    asker_id integer NOT NULL,
    answerer_id integer
);


--
-- Name: api_add_question(text, text, integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_add_question(_content text, _status text, _session_id integer, _tags integer[]) RETURNS SETOF public.questions
    LANGUAGE plpgsql
    AS $$
DECLARE
inserted_question integer;
tag integer;
asker users%rowtype;
_asker_id integer;
begin
	select * into asker from api_get_current_user();
	if (asker is null) then
		raise exception 'Cannot add question: no user is logged in.';
	else
		_asker_id := asker.user_id;
		INSERT INTO questions(content, status, session_id, asker_id)
		values (_content, _status, _session_id, _asker_id) returning question_id INTO inserted_question;
		FOREACH tag in ARRAY _tags
		LOOP
			INSERT INTO question_tags(question_id, tag_id) VALUES (inserted_question, tag);
		END LOOP;
		RETURN QUERY select * from questions where question_id = inserted_question;
	end if;
END
$$;


--
-- Name: session_series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_series (
    session_series_id integer NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    building text NOT NULL,
    room text NOT NULL,
    course_id integer NOT NULL
);


--
-- Name: api_create_series(timestamp with time zone, timestamp with time zone, text, text, integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_create_series(_start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _course_id integer, _tas integer[]) RETURNS SETOF public.session_series
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
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    building text NOT NULL,
    room text NOT NULL,
    session_series_id integer,
    course_id integer NOT NULL
);


--
-- Name: api_create_session(timestamp with time zone, timestamp with time zone, text, text, integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_create_session(_start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _course_id integer, _tas integer[]) RETURNS SETOF public.sessions
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
-- Name: api_edit_series(integer, timestamp with time zone, timestamp with time zone, text, text, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_edit_series(_series_id integer, _start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _tas integer[]) RETURNS SETOF public.session_series
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
-- Name: api_edit_session(integer, timestamp with time zone, timestamp with time zone, text, text, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_edit_session(_session_id integer, _start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _tas integer[]) RETURNS SETOF public.sessions
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
    created_at timestamp with time zone DEFAULT now(),
    last_activity_at timestamp with time zone DEFAULT now(),
    photo_url text,
    display_name text
);


--
-- Name: api_find_or_create_user(text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_find_or_create_user(_email text, _google_id text, _first_name text, _last_name text, _photo_url text, _display_name text) RETURNS SETOF public.users
    LANGUAGE plpgsql
    AS $$ 

declare

caller integer;
_user_id integer;
course_row courses%rowtype;

begin
	caller := (current_setting('jwt.claims.userId', true)::integer);
	
	if (caller is null or caller != -1) then
		_user_id := -1;

	elsif ((select count(*) from users where google_id = _google_id) > 0) then

		select user_id into _user_id from users where google_id = _google_id;
		update users set (email, first_name, last_name, photo_url, display_name, last_activity_at) =
			(_email, _first_name, _last_name, _photo_url, _display_name, NOW())
		where user_id = _user_id;

	else

		insert into users (email, google_id, first_name, last_name, photo_url, display_name)

		values (_email, _google_id, _first_name, _last_name, _photo_url, _display_name)

		returning user_id into _user_id;
		for course_row in
			select * from courses
		loop
			insert into course_users (course_id, user_id, role) values (course_row.course_id, _user_id, 'student');
		end loop;

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
-- Name: api_get_sessions(integer, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.api_get_sessions(_course_id integer, _begin_time timestamp with time zone, _end_time timestamp with time zone) RETURNS SETOF public.sessions
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
start_date_week timestamp with time zone;
start_date timestamp with time zone;
end_date_week timestamp with time zone;
end_date timestamp with time zone;
cur_date timestamp with time zone;
session_start_time timestamp with time zone;
session_end_time timestamp with time zone;
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
-- Name: internal_get_user_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_get_user_id() RETURNS integer
    LANGUAGE sql STABLE
    AS $$



select (current_setting('jwt.claims.userId', true)::integer);



$$;


--
-- Name: internal_get_user_role(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_get_user_role(_course_id integer) RETURNS text
    LANGUAGE sql STABLE
    AS $$



select role from course_users where (course_id, user_id) = (_course_id, (select internal_get_user_id()))



$$;


--
-- Name: internal_is_queue_open(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_is_queue_open(_session_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$

declare

_course_id integer;

_open_interval interval;

_start_time timestamptz;

_end_time timestamptz;

begin

	select course_id, start_time, end_time into _course_id, _start_time, _end_time

		from sessions where session_id = _session_id;

	select queue_open_interval into _open_interval from courses where course_id = _course_id;

	if ((NOW() >= (_start_time - _open_interval)) and (NOW() <= _end_time)) then

		return true;

	else

		return false;

	end if;

end

$$;


--
-- Name: internal_owns_question(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_owns_question(_question_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$

declare

_asker_id integer;

_session_id integer;

_course_id integer;

_role text;

begin

	select asker_id into _asker_id from questions where question_id = _question_id;

	if ((select internal_get_user_id()) = _asker_id) then 

		return true;

	end if;

	select session_id into _session_id from questions where question_id = _question_id;

	select course_id into _course_id from sessions where session_id = _session_id;

	select internal_get_user_role(_course_id) into _role;

	if (_role = 'professor' or _role = 'ta') then

		return true;

	else

		return false;

	end if;

end

$$;


--
-- Name: internal_owns_tag(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_owns_tag(_tag_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$

declare

_course_id integer;

_role text;

begin

	select course_id into _course_id from tags where tag_id = _tag_id;

	select internal_get_user_role(_course_id) into _role;

	if (_role = 'professor') then

		return true;

	else

		return false;

	end if;

end

$$;


--
-- Name: internal_sync_series_sessions(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_sync_series_sessions(_series_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$ 

declare

_start_time timestamp with time zone;

_end_time timestamp with time zone;

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
-- Name: internal_write_policy_series_ta(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_write_policy_series_ta(_series_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$

declare

_course_id integer;

_role text;

begin

	select course_id into _course_id from session_series where session_series_id = _series_id;

	select internal_get_user_role(_course_id) into _role;

	if (_role = 'professor' or _role = 'ta') then

		return true;

	else

		return false;

	end if;

end

$$;


--
-- Name: internal_write_policy_session_ta(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.internal_write_policy_session_ta(_session_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$

declare

_course_id integer;

_role text;

begin

	select course_id into _course_id from sessions where session_id = _session_id;

	select internal_get_user_role(_course_id) into _role;

	if (_role = 'professor' or _role = 'ta') then

		return true;

	else

		return false;

	end if;

end

$$;


--
-- Name: trigger_after_insert_course(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_after_insert_course() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ 

declare

user_row users%rowtype;

begin

	for user_row in

		select * from users

	loop

		insert into course_users (course_id, user_id, role) values (new.course_id, user_row.user_id, 'student');

	end loop;
	return new;

end

 $$;


--
-- Name: trigger_before_update_question(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_before_update_question() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

declare

answerer users%rowtype;

_answerer_id integer;

begin

	select * into answerer from api_get_current_user();

	if (answerer is null) then

		raise exception 'Cannot update question: no user is logged in.';

	else

		_answerer_id := answerer.user_id;

		new.answerer_id = _answerer_id;
		new.time_addressed = NOW();

		return new;

	end if;

END

 $$;


--
-- Name: users_computed_avatar(public.users); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.users_computed_avatar(u public.users) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$

begin

	if (u.photo_url is not null) then

		return u.photo_url;

	else

		return '/static/media/userAvatar.28b5e338.svg';

	end if;

end

$$;


--
-- Name: users_computed_name(public.users); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.users_computed_name(u public.users) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$

begin

	if (u.display_name is not null) then

		return u.display_name;

	elseif ((u.first_name is not null) or (u.last_name is not null)) then

		return concat_ws(' ', u.first_name, u.last_name);

	else

		return u.email;

	end if;

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
    end_date date NOT NULL,
    queue_open_interval interval DEFAULT '00:30:00'::interval NOT NULL
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
    level integer NOT NULL,
    activated boolean
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
1	19	student
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (course_id, code, name, semester, start_date, end_date, queue_open_interval) FROM stdin;
1	CS 1380	Data Science For All	FA18	2018-06-28	2018-08-13	1 day
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.question_tags (question_id, tag_id) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions (question_id, content, time_entered, status, time_addressed, session_id, asker_id, answerer_id) FROM stdin;
\.


--
-- Data for Name: session_series; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_series (session_series_id, start_time, end_time, building, room, course_id) FROM stdin;
23	2018-07-09 10:00:00-04	2018-07-09 11:00:00-04	Gates	G11	1
24	2018-07-09 12:30:00-04	2018-07-09 14:00:00-04	Rhodes	402	1
25	2018-07-03 10:30:00-04	2018-07-03 11:15:00-04	Gates	343	1
\.


--
-- Data for Name: session_series_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_series_tas (session_series_id, user_id) FROM stdin;
23	1
24	3
25	8
\.


--
-- Data for Name: session_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session_tas (session_id, user_id) FROM stdin;
272	1
273	1
274	1
275	1
276	1
277	3
278	3
279	3
280	3
281	3
282	8
283	8
284	8
285	8
286	8
287	1
287	3
288	3
288	8
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (session_id, start_time, end_time, building, room, session_series_id, course_id) FROM stdin;
277	2018-07-16 12:30:00-04	2018-07-16 14:00:00-04	Rhodes	402	24	1
278	2018-07-23 12:30:00-04	2018-07-23 14:00:00-04	Rhodes	402	24	1
279	2018-07-30 12:30:00-04	2018-07-30 14:00:00-04	Rhodes	402	24	1
280	2018-08-06 12:30:00-04	2018-08-06 14:00:00-04	Rhodes	402	24	1
281	2018-08-13 12:30:00-04	2018-08-13 14:00:00-04	Rhodes	402	24	1
282	2018-07-10 10:30:00-04	2018-07-10 11:15:00-04	Gates	343	25	1
283	2018-07-17 10:30:00-04	2018-07-17 11:15:00-04	Gates	343	25	1
284	2018-07-24 10:30:00-04	2018-07-24 11:15:00-04	Gates	343	25	1
285	2018-07-31 10:30:00-04	2018-07-31 11:15:00-04	Gates	343	25	1
286	2018-08-07 10:30:00-04	2018-08-07 11:15:00-04	Gates	343	25	1
287	2018-07-15 13:30:00-04	2018-07-15 14:30:00-04	Upson	B60	\N	1
288	2018-07-22 14:30:00-04	2018-07-22 15:30:00-04	Upson	B10	\N	1
272	2018-07-16 10:00:00-04	2018-07-16 11:00:00-04	Gates	G11	23	1
273	2018-07-23 10:00:00-04	2018-07-23 11:00:00-04	Gates	G11	23	1
274	2018-07-30 10:00:00-04	2018-07-30 11:00:00-04	Gates	G11	23	1
275	2018-08-06 10:00:00-04	2018-08-06 11:00:00-04	Gates	G11	23	1
276	2018-08-13 10:00:00-04	2018-08-13 11:00:00-04	Gates	G11	23	1
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

COPY public.tags (tag_id, name, course_id, level, activated) FROM stdin;
8	Q1	1	2	\N
9	Q2	1	2	\N
10	Q3	1	2	\N
11	Q1	1	2	\N
12	Q2	1	2	\N
13	Q3	1	2	\N
14	Q4	1	2	\N
15	Q1a	1	2	\N
16	Q1b	1	2	\N
17	Q2	1	2	\N
18	Written Part	1	2	\N
19	Programming	1	2	\N
20	Regrade	1	2	\N
21	Feedback	1	2	\N
22	Regrade	1	2	\N
23	Feedback	1	2	\N
24	Logistics	1	2	\N
25	Grading	1	2	\N
26	Office Hours	1	2	\N
27	Other	1	2	\N
1	Assignment 1	1	1	t
2	Assignment 2	1	1	t
3	Assignment 3	1	1	t
4	Assignment 4	1	1	f
5	Prelim	1	1	t
6	Final	1	1	f
7	General	1	1	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, email, google_id, first_name, last_name, created_at, last_activity_at, photo_url, display_name) FROM stdin;
1	cv231@cornell.edu	115064340704113209584	Corey	Valdez	2018-03-25 03:07:23.485-04	2018-03-25 03:07:26.391-04	https://randomuser.me/api/portraits/men/46.jpg	Corey Valdez
2	ejs928@cornell.edu	139064340704113209582	Edgar	Stewart	2018-03-25 03:08:05.668-04	2018-03-25 03:08:08.294-04	https://randomuser.me/api/portraits/men/7.jpg	Edgar Stewart
3	asm2292@cornell.edu	115064340704118374059	Ada	Morton	2018-03-25 03:08:51.563-04	2018-03-25 03:08:54.084-04	https://randomuser.me/api/portraits/women/8.jpg	Ada Morton
4	cr848@cornell.edu	215064340704113209584	Caroline	Robinson	2018-03-25 03:09:25.563-04	2018-03-25 03:09:28.525-04	https://randomuser.me/api/portraits/women/59.jpg	Caroline Robinson
5	ca449@cornell.edu	115064340704113209332	Christopher	Arnold	2018-03-25 03:10:28.166-04	2018-03-25 03:10:32.518-04	\N	Chris Arnold
6	zz527@cornell.edu	115064340704113209009	Zechen	Zhang	2018-03-25 03:11:20.394-04	2018-03-25 03:11:22.765-04	\N	Zechen Zhang
7	sjw748@cornell.edu	115064340704113209877	Susan	Wilson	2018-03-25 03:12:45.328-04	2018-03-25 03:12:47.826-04	https://randomuser.me/api/portraits/women/81.jpg	Sue Wilson
8	clarkson@cs.cornell.edu	115064340704113209999	Michael	Clarkson	2018-03-25 03:13:26.996-04	2018-03-25 03:13:29.4-04	https://randomuser.me/api/portraits/men/20.jpg	Michael Clarkson
19	ks939@cornell.edu	114961512147775594594	Karun	Singh	2018-07-11 09:38:34.214871-04	2018-07-11 09:39:07.517853-04	https://lh5.googleusercontent.com/-5atJCQlqmEM/AAAAAAAAAAI/AAAAAAAARN8/-TM5RNTPV0w/photo.jpg	Karun Singh
\.


--
-- Name: courses_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_course_id_seq', 3, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.questions_question_id_seq', 20, true);


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.session_series_session_series_id_seq', 27, true);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_session_id_seq', 288, true);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_tag_id_seq', 35, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 22, true);


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
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_googleid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_googleid_key UNIQUE (google_id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (user_id);


--
-- Name: courses after_insert_course; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_insert_course AFTER INSERT ON public.courses FOR EACH ROW EXECUTE PROCEDURE public.trigger_after_insert_course();


--
-- Name: questions before_update_question; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER before_update_question BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE PROCEDURE public.trigger_before_update_question();


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
-- Name: course_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_users ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: session_series delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON public.session_series FOR DELETE TO backend USING (((( SELECT public.internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT public.internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_series_tas delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON public.session_series_tas FOR DELETE TO backend USING (( SELECT public.internal_write_policy_series_ta(session_series_tas.session_series_id) AS internal_write_policy_series_ta));


--
-- Name: sessions delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON public.sessions FOR DELETE TO backend USING (((( SELECT public.internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT public.internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_tas delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON public.session_tas FOR DELETE TO backend USING (( SELECT public.internal_write_policy_session_ta(session_tas.session_id) AS internal_write_policy_session_ta));


--
-- Name: tags delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON public.tags FOR DELETE TO backend USING ((( SELECT public.internal_get_user_role(tags.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: tag_relations delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON public.tag_relations FOR DELETE TO backend USING ((( SELECT public.internal_owns_tag(tag_relations.parent_id) AS internal_owns_tag) AND ( SELECT public.internal_owns_tag(tag_relations.child_id) AS internal_owns_tag)));


--
-- Name: question_tags delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON public.question_tags FOR DELETE TO backend USING ((( SELECT questions.asker_id
   FROM public.questions
  WHERE (questions.question_id = questions.question_id)) = ( SELECT public.internal_get_user_id() AS internal_get_user_id)));


--
-- Name: users insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.users FOR INSERT TO backend WITH CHECK ((( SELECT public.internal_get_user_id() AS internal_get_user_id) = '-1'::integer));


--
-- Name: course_users insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.course_users FOR INSERT TO backend WITH CHECK ((role = 'student'::text));


--
-- Name: session_series insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.session_series FOR INSERT TO backend WITH CHECK (((( SELECT public.internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT public.internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_series_tas insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.session_series_tas FOR INSERT TO backend WITH CHECK (( SELECT public.internal_write_policy_series_ta(session_series_tas.session_series_id) AS internal_write_policy_series_ta));


--
-- Name: sessions insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.sessions FOR INSERT TO backend WITH CHECK (((( SELECT public.internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT public.internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_tas insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.session_tas FOR INSERT TO backend WITH CHECK (( SELECT public.internal_write_policy_session_ta(session_tas.session_id) AS internal_write_policy_session_ta));


--
-- Name: tags insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.tags FOR INSERT TO backend WITH CHECK ((( SELECT public.internal_get_user_role(tags.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: tag_relations insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.tag_relations FOR INSERT TO backend WITH CHECK ((( SELECT public.internal_owns_tag(tag_relations.parent_id) AS internal_owns_tag) AND ( SELECT public.internal_owns_tag(tag_relations.child_id) AS internal_owns_tag)));


--
-- Name: question_tags insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.question_tags FOR INSERT TO backend WITH CHECK ((( SELECT questions.asker_id
   FROM public.questions
  WHERE (questions.question_id = questions.question_id)) = ( SELECT public.internal_get_user_id() AS internal_get_user_id)));


--
-- Name: questions insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON public.questions FOR INSERT TO backend WITH CHECK (((asker_id = ( SELECT public.internal_get_user_id() AS internal_get_user_id)) AND ( SELECT public.internal_is_queue_open(questions.session_id) AS internal_is_queue_open)));


--
-- Name: question_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: courses read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.courses FOR SELECT TO backend USING (true);


--
-- Name: users read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.users FOR SELECT TO backend USING (true);


--
-- Name: course_users read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.course_users FOR SELECT TO backend USING (true);


--
-- Name: session_series read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.session_series FOR SELECT TO backend USING (true);


--
-- Name: session_series_tas read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.session_series_tas FOR SELECT TO backend USING (true);


--
-- Name: sessions read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.sessions FOR SELECT TO backend USING (true);


--
-- Name: session_tas read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.session_tas FOR SELECT TO backend USING (true);


--
-- Name: tags read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.tags FOR SELECT TO backend USING (true);


--
-- Name: tag_relations read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.tag_relations FOR SELECT TO backend USING (true);


--
-- Name: question_tags read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.question_tags FOR SELECT TO backend USING (true);


--
-- Name: questions read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON public.questions FOR SELECT TO backend USING (true);


--
-- Name: session_series; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_series ENABLE ROW LEVEL SECURITY;

--
-- Name: session_series_tas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_series_tas ENABLE ROW LEVEL SECURITY;

--
-- Name: session_tas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_tas ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: tag_relations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tag_relations ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: users update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.users FOR UPDATE TO backend USING ((user_id = ( SELECT public.internal_get_user_id() AS internal_get_user_id)));


--
-- Name: course_users update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.course_users FOR UPDATE TO backend USING ((( SELECT public.internal_get_user_role(course_users.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: session_series update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.session_series FOR UPDATE TO backend USING (((( SELECT public.internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT public.internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_series_tas update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.session_series_tas FOR UPDATE TO backend USING (( SELECT public.internal_write_policy_series_ta(session_series_tas.session_series_id) AS internal_write_policy_series_ta));


--
-- Name: sessions update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.sessions FOR UPDATE TO backend USING (((( SELECT public.internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT public.internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_tas update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.session_tas FOR UPDATE TO backend USING (( SELECT public.internal_write_policy_session_ta(session_tas.session_id) AS internal_write_policy_session_ta));


--
-- Name: tags update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.tags FOR UPDATE TO backend USING ((( SELECT public.internal_get_user_role(tags.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: tag_relations update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.tag_relations FOR UPDATE TO backend USING ((( SELECT public.internal_owns_tag(tag_relations.parent_id) AS internal_owns_tag) AND ( SELECT public.internal_owns_tag(tag_relations.child_id) AS internal_owns_tag)));


--
-- Name: question_tags update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.question_tags FOR UPDATE TO backend USING ((( SELECT questions.asker_id
   FROM public.questions
  WHERE (questions.question_id = questions.question_id)) = ( SELECT public.internal_get_user_id() AS internal_get_user_id)));


--
-- Name: questions update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON public.questions FOR UPDATE TO backend USING (( SELECT public.internal_owns_question(questions.question_id) AS internal_owns_question));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE questions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.questions TO backend;


--
-- Name: TABLE session_series; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.session_series TO backend;


--
-- Name: TABLE sessions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.sessions TO backend;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.users TO backend;


--
-- Name: TABLE course_users; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.course_users TO backend;


--
-- Name: TABLE courses; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.courses TO backend;


--
-- Name: SEQUENCE courses_course_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.courses_course_id_seq TO backend;


--
-- Name: TABLE question_tags; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.question_tags TO backend;


--
-- Name: SEQUENCE questions_question_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.questions_question_id_seq TO backend;


--
-- Name: SEQUENCE session_series_session_series_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.session_series_session_series_id_seq TO backend;


--
-- Name: TABLE session_series_tas; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.session_series_tas TO backend;


--
-- Name: TABLE session_tas; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.session_tas TO backend;


--
-- Name: SEQUENCE sessions_session_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.sessions_session_id_seq TO backend;


--
-- Name: TABLE tag_relations; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.tag_relations TO backend;


--
-- Name: TABLE tags; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.tags TO backend;


--
-- Name: SEQUENCE tags_tag_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.tags_tag_id_seq TO backend;


--
-- Name: SEQUENCE users_user_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE public.users_user_id_seq TO backend;


--
-- PostgreSQL database dump complete
--

