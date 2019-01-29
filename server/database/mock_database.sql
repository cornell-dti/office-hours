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

--
-- Name: jwt_token; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE jwt_token AS (
	user_id integer
);


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE questions (
    question_id integer NOT NULL,
    content text NOT NULL,
    time_entered timestamp with time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    time_addressed timestamp with time zone,
    session_id integer NOT NULL,
    asker_id integer NOT NULL,
    answerer_id integer,
    location text
);


--
-- Name: api_add_question(text, text, integer, integer[], text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_add_question(_content text, _status text, _session_id integer, _tags integer[], _location text) RETURNS SETOF questions
    LANGUAGE plpgsql
    AS $$
DECLARE
inserted_question integer;
tag integer;
asker users%rowtype;
_asker_id integer;
questions_asked integer;
checked_session_ids integer[];
checked_session_id integer;
_end_time timestamp without time zone;
questions questions%rowtype;
_course_id integer;
_char_limit integer;
begin
	select * into asker from api_get_current_user();
	

	if (asker is null) then
		raise exception 'Cannot add question: no user is logged in.';
	else
		_asker_id := asker.user_id;
		select count(*) into questions_asked from questions where asker_id = _asker_id AND status = 'unresolved';
		
		if (questions_asked > 0) then 
		-- if there are questions asked, get session ids from questions asked
			checked_session_ids := ARRAY (select session_id from questions where asker_id = _asker_id AND status = 'unresolved');	
		
		-- loop through session ids, if they are all expired, then allow 
			FOREACH checked_session_id in ARRAY checked_session_ids
			LOOP
				select end_time INTO _end_time from sessions WHERE session_id = checked_session_id;
				if (_end_time > NOW()) then
					raise exception 'Cannot add question: currently asking in another queue';
				end if;
			END LOOP;
		end if;
	
		select course_id into _course_id from sessions where session_id = _session_id;
		select char_limit into _char_limit from courses where course_id = _course_id;
		if (length(_content) > _char_limit) then
			raise exception 'Question asked is longer than character limit';
		end if;

		INSERT INTO questions(content, status, session_id, asker_id, location)
		values (_content, _status, _session_id, _asker_id, _location) returning question_id INTO inserted_question;
		FOREACH tag in ARRAY _tags
		LOOP
			INSERT INTO question_tags(question_id, tag_id) VALUES (inserted_question, tag);
		END LOOP;
		RETURN QUERY select * from questions where question_id = inserted_question;
	end if;
END
$$;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tags (
    tag_id integer NOT NULL,
    name text NOT NULL,
    course_id integer NOT NULL,
    level integer NOT NULL,
    activated boolean DEFAULT true NOT NULL
);


--
-- Name: api_create_primary_tag(integer, text, boolean, text[], integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_create_primary_tag(_course_id integer, _iname text, _activated boolean, _child_names text[], _child_activateds integer[]) RETURNS SETOF tags
    LANGUAGE plpgsql
    AS $$



declare

parent_id integer;

child_id integer;



begin 



	insert into tags("course_id", "name", "level", "activated") values (_course_id, _iname, 1, _activated) returning tag_id into parent_id;



	for i in 1 .. (select array_length(_child_names, 1)) loop



		insert into tags("course_id", "name", "level", "activated") values (_course_id, _child_names[i], 2, cast(_child_activateds[i] as bool)) returning tag_id into child_id;

		insert into tag_relations("parent_id", "child_id") values (parent_id, child_id);



	end loop;



	return query (select * from tags where tag_id = parent_id);



end



 $$;


--
-- Name: session_series; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE session_series (
    session_series_id integer NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    building text NOT NULL,
    room text NOT NULL,
    course_id integer NOT NULL,
    title text
);


--
-- Name: api_create_series(timestamp with time zone, timestamp with time zone, text, text, integer, integer[], text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_create_series(_start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _course_id integer, _tas integer[], _title text) RETURNS SETOF session_series
    LANGUAGE plpgsql
    AS $$

declare
series_id integer;
ta integer;
begin
	insert into session_series (start_time, end_time, building, room, course_id, title)
		values (_start_time, _end_time, _building, _room, _course_id, _title) returning session_series_id into series_id;
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

CREATE TABLE sessions (
    session_id integer NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    building text NOT NULL,
    room text NOT NULL,
    session_series_id integer,
    course_id integer NOT NULL,
    title text
);


--
-- Name: api_create_session(timestamp with time zone, timestamp with time zone, text, text, integer, integer[], text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_create_session(_start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _course_id integer, _tas integer[], _title text) RETURNS SETOF sessions
    LANGUAGE plpgsql
    AS $$

declare
_session_id integer;
ta integer;
begin
	if (_end_time > NOW()) then
		insert into sessions (start_time, end_time, building, room, course_id, session_series_id, title)
			values (_start_time, _end_time, _building, _room, _course_id, NULL, _title) returning session_id into _session_id;
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

CREATE FUNCTION api_delete_series(_series_id integer) RETURNS void
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

CREATE FUNCTION api_delete_session(_session_id integer) RETURNS void
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
-- Name: api_edit_primary_tag(integer, text, boolean, integer[], text[], integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_edit_primary_tag(_parent_id integer, _iname text, _activated boolean, _child_ids integer[], _child_names text[], _child_activateds integer[]) RETURNS SETOF tags
    LANGUAGE plpgsql
    AS $$

declare

child_id integer;

_course_id integer;

begin 



	update tags set ("name", "activated") = (_iname, _activated) where tag_id = _parent_id;

	select course_id into _course_id from tags where tag_id = _parent_id;



	for i in 1 .. (select array_length(_child_ids, 1)) loop



		if (_child_ids[i] = -1) then

			insert into tags("course_id", "name", "level", "activated") values (_course_id, _child_names[i], 2, cast(_child_activateds[i] as bool)) returning tag_id into child_id;

			insert into tag_relations("parent_id", "child_id") values (_parent_id, child_id);

		else

			update tags set ("name", "activated") = (_child_names[i], cast(_child_activateds[i] as bool)) where tag_id = _child_ids[i];

		end if;



	end loop;



	return query (select * from tags where tag_id = _parent_id);



end



 $$;


--
-- Name: api_edit_series(integer, timestamp with time zone, timestamp with time zone, text, text, integer[], text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_edit_series(_series_id integer, _start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _tas integer[], _title text) RETURNS SETOF session_series
    LANGUAGE plpgsql
    AS $$

declare
ta integer;
begin
	update session_series
	set start_time=_start_time, end_time=_end_time, building=_building, room=_room, title=_title
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
-- Name: api_edit_session(integer, timestamp with time zone, timestamp with time zone, text, text, integer[], text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_edit_session(_session_id integer, _start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _tas integer[], _title text) RETURNS SETOF sessions
    LANGUAGE plpgsql
    AS $$

declare
ta integer;
begin
	if (select end_time from sessions where session_id = _session_id) > NOW() then
		update sessions set (start_time, end_time, building, room, session_series_id, title) =
			(_start_time, _end_time, _building, _room, NULL, _title) where session_id = _session_id;
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

CREATE TABLE users (
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

CREATE FUNCTION api_find_or_create_user(_email text, _google_id text, _first_name text, _last_name text, _photo_url text, _display_name text) RETURNS SETOF users
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

CREATE FUNCTION api_get_current_user() RETURNS SETOF users
    LANGUAGE sql STABLE
    AS $$

select * from users where user_id = (current_setting('jwt.claims.userId', true)::integer);

$$;


--
-- Name: api_get_sessions(integer, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_get_sessions(_course_id integer, _begin_time timestamp with time zone, _end_time timestamp with time zone) RETURNS SETOF sessions
    LANGUAGE sql STABLE
    AS $$
select * from sessions where start_time >= _begin_time AND start_time < _end_time AND course_id = _course_id ORDER BY start_time ASC;
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
-- Name: api_update_course_user_role(integer, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION api_update_course_user_role(_course_id integer, _user_id integer, _role text) RETURNS SETOF course_users
    LANGUAGE plpgsql
    AS $$
    begin
        case
            when _role = 'ta' OR _role = 'student' OR _role = 'professor' then
            update course_users set "role" = _role where course_id = _course_id AND user_id = _user_id;
            else
        end case;
        return query (select * from course_users where course_id = _course_id AND user_id = _user_id);
    end
$$;


--
-- Name: internal_create_sessions_from_series(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION internal_create_sessions_from_series(_series_id integer) RETURNS SETOF sessions
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
title text;
begin
IF (SELECT COUNT(*) FROM sessions where session_series_id = _series_id) > 0 THEN
    RAISE EXCEPTION 'Sessions with this series_id already exist!';
END IF;
course := (SELECT course_id FROM session_series WHERE session_series_id = _series_id);
start_date_week := date_trunc('week', (SELECT courses.start_date from courses WHERE course_id = course));
start_date := date_trunc('day', (SELECT courses.start_date from courses WHERE course_id = course));
end_date_week := date_trunc('week', (SELECT courses.end_date from courses WHERE course_id = course));
end_date := date_trunc('day', (SELECT courses.end_date from courses WHERE course_id = course));
SELECT session_series.start_time, session_series.end_time, session_series.building, session_series.room, session_series.title
    INTO session_start_time, session_end_time, building, room, title
    FROM session_series WHERE session_series_id = _series_id;
session_start_offset := session_start_time - date_trunc('week', session_start_time);
session_end_offset := session_end_time - date_trunc('week', session_start_time) ;
cur_date := start_date_week;
while cur_date <= end_date_week loop
	if ((cur_date + session_end_offset) > NOW()) and ((cur_date + session_start_offset) >= start_date)
		and ((cur_date + session_start_offset) <= (end_date + interval '1 day')) then
		INSERT INTO sessions(start_time, end_time, building, room, session_series_id, course_id, title)
		values
		(cur_date + session_start_offset, cur_date + session_end_offset, building, room, _series_id, course, title);
    end if;
	cur_date := cur_date + interval '1 week';
END LOOP;
RETURN QUERY (SELECT * FROM sessions where session_series_id = _series_id);
END
$$;


--
-- Name: internal_get_user_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION internal_get_user_id() RETURNS integer
    LANGUAGE sql STABLE
    AS $$



select (current_setting('jwt.claims.userId', true)::integer);



$$;


--
-- Name: internal_get_user_role(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION internal_get_user_role(_course_id integer) RETURNS text
    LANGUAGE sql STABLE
    AS $$



select role from course_users where (course_id, user_id) = (_course_id, (select internal_get_user_id()))



$$;


--
-- Name: internal_is_queue_open(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION internal_is_queue_open(_session_id integer) RETURNS boolean
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

CREATE FUNCTION internal_owns_question(_question_id integer) RETURNS boolean
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

CREATE FUNCTION internal_owns_tag(_tag_id integer) RETURNS boolean
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

CREATE FUNCTION internal_sync_series_sessions(_series_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$

declare
_start_time timestamp with time zone;
_end_time timestamp with time zone;
_building text;
_room text;
_course_id integer;
_title text;
session_row sessions%rowtype;
ta_row session_series_tas%rowtype;
session_start_offset interval;
session_end_offset interval;

begin
	select session_series.start_time, session_series.end_time, session_series.building, session_series.room, session_series.course_id, session_series.title
	into _start_time, _end_time, _building, _room, _course_id, _title
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
			building=_building, room=_room, course_id=_course_id, title=_title
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

CREATE FUNCTION internal_write_policy_series_ta(_series_id integer) RETURNS boolean
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

CREATE FUNCTION internal_write_policy_session_ta(_session_id integer) RETURNS boolean
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

CREATE FUNCTION trigger_after_insert_course() RETURNS trigger
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

CREATE FUNCTION trigger_before_update_question() RETURNS trigger
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
-- Name: users_computed_avatar(users); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION users_computed_avatar(u users) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$

begin

	if (u.photo_url is not null) then

		return u.photo_url;

	else

		return '/placeholder.png';

	end if;

end

$$;


--
-- Name: users_computed_name(users); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION users_computed_name(u users) RETURNS text
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
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE courses (
    course_id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    semester text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    queue_open_interval interval DEFAULT '00:30:00'::interval NOT NULL,
    char_limit integer DEFAULT 100 NOT NULL
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
-- Name: session_tas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE session_tas (
    session_id integer NOT NULL,
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
1	6	ta
1	5	student
1	7	student
1	19	student
1	1	professor
1	2	student
1	4	ta
1	3	student
2	1	student
2	2	student
2	3	student
2	5	student
2	6	student
2	7	student
2	19	student
2	8	professor
2	4	student
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY courses (course_id, code, name, semester, start_date, end_date, queue_open_interval, char_limit) FROM stdin;
1	CS 1380	Data Science For All	FA18	2018-06-28	2019-10-13	1 day	30
2	CS 1110	Python	SP19	2019-01-20	2019-05-15	00:30:00	60
\.


--
-- Data for Name: question_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY question_tags (question_id, tag_id) FROM stdin;
21	1
21	9
22	1
22	9
23	1
23	9
24	2
24	13
25	1
25	10
26	1
26	10
27	2
27	13
28	1
28	9
29	1
29	10
30	2
30	14
31	3
31	17
32	3
32	17
42	5
42	21
43	2
43	71
44	3
44	16
45	5
45	21
46	3
46	17
47	3
47	16
48	5
48	21
49	5
49	21
50	87
50	88
51	87
51	88
52	87
52	88
53	87
53	88
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY questions (question_id, content, time_entered, status, time_addressed, session_id, asker_id, answerer_id, location) FROM stdin;
27	asdf	2018-08-13 23:53:00.559984-04	retracted	2018-08-13 23:55:03.705274-04	281	2	2	\N
28	test	2018-08-13 23:55:08.755926-04	unresolved	\N	281	2	\N	\N
21	asdf	2018-08-13 04:11:43.006901-04	retracted	2018-08-13 23:56:24.330621-04	276	2	2	\N
22	asdf	2018-08-13 23:44:05.766539-04	retracted	2018-08-13 23:56:25.244772-04	276	2	2	\N
23	asdf	2018-08-13 23:44:28.721481-04	retracted	2018-08-13 23:56:30.391607-04	276	2	2	\N
24	asdf	2018-08-13 23:45:40.261475-04	retracted	2018-08-13 23:56:33.598115-04	276	2	2	\N
26	asdf	2018-08-13 23:52:51.090955-04	retracted	2018-08-13 23:56:41.418089-04	290	2	2	\N
30	test	2018-08-13 23:56:54.75322-04	retracted	2018-08-14 00:01:02.62037-04	276	2	2	\N
31	asdf	2018-08-14 00:01:10.213082-04	retracted	2018-08-14 00:03:22.308048-04	276	2	2	\N
29	test	2018-08-13 23:56:45.78248-04	retracted	2018-08-14 00:09:53.262724-04	290	2	2	\N
25	asdf	2018-08-13 23:46:27.336446-04	retracted	2018-08-14 00:09:57.147415-04	289	2	2	\N
32	asdf	2018-08-14 00:10:01.239741-04	retracted	2018-08-17 02:26:31.828306-04	289	2	2	\N
37	ok	2018-09-27 14:32:18.704888-04	retracted	2018-09-27 14:35:29.327401-04	304	5	5	\N
38	j	2018-09-27 14:35:34.21397-04	retracted	2018-09-27 14:36:01.991654-04	304	5	5	\N
39	ok	2018-09-27 14:36:05.701786-04	retracted	2018-09-27 14:36:39.100188-04	304	5	5	\N
40	ok	2018-09-27 14:37:42.950246-04	retracted	2018-09-27 14:37:45.330263-04	304	5	5	\N
41	ok	2018-09-27 14:37:49.844335-04	retracted	2018-09-27 14:37:52.651516-04	304	5	5	\N
42	Why did I get a -1%?	2018-11-14 16:00:23.902054-05	assigned	2018-11-14 16:12:57.88142-05	391	5	8	\N
43	Help!	2018-11-14 16:29:08.027072-05	unresolved	2018-11-14 16:53:11.248531-05	391	2	8	\N
52	Fun	2019-01-29 10:24:38.132471-05	unresolved	2019-01-29 10:47:12.488465-05	396	6	6	Ithaca Ale House
53	Testing	2019-01-29 16:54:14.603683-05	unresolved	\N	396	2	\N	Home
45	Feedbacks	2018-11-18 12:24:59.037489-05	assigned	2018-11-18 13:09:40.548819-05	392	2	8	\N
44	My Question	2018-11-18 12:24:31.554661-05	assigned	2018-11-18 13:13:00.843297-05	392	5	8	\N
46	Lol	2018-11-18 13:00:48.495168-05	unresolved	2018-11-18 13:13:02.962035-05	392	4	8	\N
47	Question\n	2018-11-26 14:06:49.727298-05	assigned	2018-11-26 14:07:21.635702-05	393	4	8	\N
48	Help	2018-11-26 14:07:03.948963-05	assigned	2018-11-26 14:08:10.64293-05	393	5	1	\N
49	OK	2018-12-02 13:24:53.6956-05	resolved	2018-12-02 13:25:07.039605-05	394	5	1	\N
50	OK Computer is the best radiohead album	2019-01-29 09:58:39.971085-05	unresolved	\N	396	7	\N	\N
51	Pyenv	2019-01-29 10:00:51.708243-05	retracted	2019-01-29 10:24:14.28336-05	396	6	6	Home
\.


--
-- Data for Name: session_series; Type: TABLE DATA; Schema: public; Owner: -
--

COPY session_series (session_series_id, start_time, end_time, building, room, course_id, title) FROM stdin;
23	2018-07-09 10:00:00-04	2018-07-09 11:00:00-04	Gates	G11	1	\N
24	2018-07-09 12:30:00-04	2018-07-09 14:00:00-04	Rhodes	402	1	\N
25	2018-07-03 10:30:00-04	2018-07-03 11:15:00-04	Gates	343	1	\N
28	2018-08-13 03:00:00-04	2018-08-13 04:30:00-04	Gates	123	1	\N
29	2018-08-14 10:30:00-04	2018-08-14 13:00:00-04	Gates	122	1	\N
30	2018-08-14 19:30:00-04	2018-08-15 01:30:00-04	Gates	B12	1	\N
31	2018-08-15 03:30:00-04	2018-08-15 05:00:00-04	Gates	123	1	\N
32	2018-08-31 12:00:58.789-04	2018-08-31 13:00:58.789-04	Olin	155	1	New Series Name!
33	2018-08-28 00:00:00-04	2018-08-28 01:00:00-04	Gates	G01	1	Test Data
51	2018-11-21 00:00:00-05	2018-11-21 01:00:00-05	OK	OK	1	
\.


--
-- Data for Name: session_series_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY session_series_tas (session_series_id, user_id) FROM stdin;
23	1
24	3
25	8
28	6
29	8
30	3
31	3
32	1
33	3
\.


--
-- Data for Name: session_tas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY session_tas (session_id, user_id) FROM stdin;
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
289	6
290	3
291	3
292	3
293	3
294	3
295	3
296	3
297	3
298	3
299	1
300	1
301	1
302	1
303	1
304	1
305	1
306	1
307	3
308	3
309	3
310	3
311	3
312	3
313	3
343	1
344	1
345	1
346	1
347	1
348	1
349	1
350	1
351	1
352	1
353	1
354	1
355	1
356	1
357	1
358	1
359	1
360	1
361	1
362	1
363	1
364	1
365	1
366	1
367	1
368	1
369	1
370	1
371	1
372	1
373	1
374	1
375	1
376	1
377	1
378	1
379	1
380	1
381	1
382	1
383	1
384	1
385	1
386	1
387	1
388	1
389	1
390	1
391	3
392	1
393	8
394	3
395	3
396	8
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY sessions (session_id, start_time, end_time, building, room, session_series_id, course_id, title) FROM stdin;
277	2018-07-16 12:30:00-04	2018-07-16 14:00:00-04	Rhodes	402	24	1	\N
278	2018-07-23 12:30:00-04	2018-07-23 14:00:00-04	Rhodes	402	24	1	\N
279	2018-07-30 12:30:00-04	2018-07-30 14:00:00-04	Rhodes	402	24	1	\N
280	2018-08-06 12:30:00-04	2018-08-06 14:00:00-04	Rhodes	402	24	1	\N
281	2018-08-13 12:30:00-04	2018-08-13 14:00:00-04	Rhodes	402	24	1	\N
282	2018-07-10 10:30:00-04	2018-07-10 11:15:00-04	Gates	343	25	1	\N
283	2018-07-17 10:30:00-04	2018-07-17 11:15:00-04	Gates	343	25	1	\N
284	2018-07-24 10:30:00-04	2018-07-24 11:15:00-04	Gates	343	25	1	\N
285	2018-07-31 10:30:00-04	2018-07-31 11:15:00-04	Gates	343	25	1	\N
286	2018-08-07 10:30:00-04	2018-08-07 11:15:00-04	Gates	343	25	1	\N
287	2018-07-15 13:30:00-04	2018-07-15 14:30:00-04	Upson	B60	\N	1	\N
288	2018-07-22 14:30:00-04	2018-07-22 15:30:00-04	Upson	B10	\N	1	\N
272	2018-07-16 10:00:00-04	2018-07-16 11:00:00-04	Gates	G11	23	1	\N
273	2018-07-23 10:00:00-04	2018-07-23 11:00:00-04	Gates	G11	23	1	\N
274	2018-07-30 10:00:00-04	2018-07-30 11:00:00-04	Gates	G11	23	1	\N
275	2018-08-06 10:00:00-04	2018-08-06 11:00:00-04	Gates	G11	23	1	\N
276	2018-08-13 10:00:00-04	2018-08-13 11:00:00-04	Gates	G11	23	1	\N
289	2018-08-13 03:00:00-04	2018-08-13 04:30:00-04	Gates	123	28	1	\N
290	2018-08-15 03:30:00-04	2018-08-15 05:00:00-04	Gates	123	31	1	\N
291	2018-08-22 03:30:00-04	2018-08-22 05:00:00-04	Gates	123	31	1	\N
292	2018-08-29 03:30:00-04	2018-08-29 05:00:00-04	Gates	123	31	1	\N
293	2018-09-05 03:30:00-04	2018-09-05 05:00:00-04	Gates	123	31	1	\N
294	2018-09-12 03:30:00-04	2018-09-12 05:00:00-04	Gates	123	31	1	\N
295	2018-09-19 03:30:00-04	2018-09-19 05:00:00-04	Gates	123	31	1	\N
296	2018-09-26 03:30:00-04	2018-09-26 05:00:00-04	Gates	123	31	1	\N
297	2018-10-03 03:30:00-04	2018-10-03 05:00:00-04	Gates	123	31	1	\N
298	2018-10-10 03:30:00-04	2018-10-10 05:00:00-04	Gates	123	31	1	\N
299	2018-08-24 12:00:58.789-04	2018-08-24 13:00:58.789-04	Olin	155	32	1	\N
300	2018-08-31 12:00:58.789-04	2018-08-31 13:00:58.789-04	Olin	155	32	1	\N
301	2018-09-07 12:00:58.789-04	2018-09-07 13:00:58.789-04	Olin	155	32	1	\N
302	2018-09-14 12:00:58.789-04	2018-09-14 13:00:58.789-04	Olin	155	32	1	\N
303	2018-09-21 12:00:58.789-04	2018-09-21 13:00:58.789-04	Olin	155	32	1	\N
304	2018-09-28 12:00:58.789-04	2018-09-28 13:00:58.789-04	Olin	155	32	1	\N
305	2018-10-05 12:00:58.789-04	2018-10-05 13:00:58.789-04	Olin	155	32	1	\N
306	2018-10-12 12:00:58.789-04	2018-10-12 13:00:58.789-04	Olin	155	32	1	\N
307	2018-08-28 00:00:00-04	2018-08-28 01:00:00-04	Gates	G01	33	1	Test Data
308	2018-09-04 00:00:00-04	2018-09-04 01:00:00-04	Gates	G01	33	1	Test Data
309	2018-09-11 00:00:00-04	2018-09-11 01:00:00-04	Gates	G01	33	1	Test Data
310	2018-09-18 00:00:00-04	2018-09-18 01:00:00-04	Gates	G01	33	1	Test Data
311	2018-09-25 00:00:00-04	2018-09-25 01:00:00-04	Gates	G01	33	1	Test Data
312	2018-10-02 00:00:00-04	2018-10-02 01:00:00-04	Gates	G01	33	1	Test Data
313	2018-10-09 00:00:00-04	2018-10-09 01:00:00-04	Gates	G01	33	1	Test Data
343	2018-11-14 00:00:00-05	2018-11-14 01:00:00-05	OK	OK	51	1	
344	2018-11-21 00:00:00-05	2018-11-21 01:00:00-05	OK	OK	51	1	
345	2018-11-28 00:00:00-05	2018-11-28 01:00:00-05	OK	OK	51	1	
346	2018-12-05 00:00:00-05	2018-12-05 01:00:00-05	OK	OK	51	1	
347	2018-12-12 00:00:00-05	2018-12-12 01:00:00-05	OK	OK	51	1	
348	2018-12-19 00:00:00-05	2018-12-19 01:00:00-05	OK	OK	51	1	
349	2018-12-26 00:00:00-05	2018-12-26 01:00:00-05	OK	OK	51	1	
350	2019-01-02 00:00:00-05	2019-01-02 01:00:00-05	OK	OK	51	1	
351	2019-01-09 00:00:00-05	2019-01-09 01:00:00-05	OK	OK	51	1	
352	2019-01-16 00:00:00-05	2019-01-16 01:00:00-05	OK	OK	51	1	
353	2019-01-23 00:00:00-05	2019-01-23 01:00:00-05	OK	OK	51	1	
354	2019-01-30 00:00:00-05	2019-01-30 01:00:00-05	OK	OK	51	1	
355	2019-02-06 00:00:00-05	2019-02-06 01:00:00-05	OK	OK	51	1	
356	2019-02-13 00:00:00-05	2019-02-13 01:00:00-05	OK	OK	51	1	
357	2019-02-20 00:00:00-05	2019-02-20 01:00:00-05	OK	OK	51	1	
358	2019-02-27 00:00:00-05	2019-02-27 01:00:00-05	OK	OK	51	1	
359	2019-03-06 00:00:00-05	2019-03-06 01:00:00-05	OK	OK	51	1	
360	2019-03-13 00:00:00-04	2019-03-13 01:00:00-04	OK	OK	51	1	
361	2019-03-20 00:00:00-04	2019-03-20 01:00:00-04	OK	OK	51	1	
362	2019-03-27 00:00:00-04	2019-03-27 01:00:00-04	OK	OK	51	1	
363	2019-04-03 00:00:00-04	2019-04-03 01:00:00-04	OK	OK	51	1	
364	2019-04-10 00:00:00-04	2019-04-10 01:00:00-04	OK	OK	51	1	
365	2019-04-17 00:00:00-04	2019-04-17 01:00:00-04	OK	OK	51	1	
366	2019-04-24 00:00:00-04	2019-04-24 01:00:00-04	OK	OK	51	1	
367	2019-05-01 00:00:00-04	2019-05-01 01:00:00-04	OK	OK	51	1	
368	2019-05-08 00:00:00-04	2019-05-08 01:00:00-04	OK	OK	51	1	
369	2019-05-15 00:00:00-04	2019-05-15 01:00:00-04	OK	OK	51	1	
370	2019-05-22 00:00:00-04	2019-05-22 01:00:00-04	OK	OK	51	1	
371	2019-05-29 00:00:00-04	2019-05-29 01:00:00-04	OK	OK	51	1	
372	2019-06-05 00:00:00-04	2019-06-05 01:00:00-04	OK	OK	51	1	
373	2019-06-12 00:00:00-04	2019-06-12 01:00:00-04	OK	OK	51	1	
374	2019-06-19 00:00:00-04	2019-06-19 01:00:00-04	OK	OK	51	1	
375	2019-06-26 00:00:00-04	2019-06-26 01:00:00-04	OK	OK	51	1	
376	2019-07-03 00:00:00-04	2019-07-03 01:00:00-04	OK	OK	51	1	
377	2019-07-10 00:00:00-04	2019-07-10 01:00:00-04	OK	OK	51	1	
378	2019-07-17 00:00:00-04	2019-07-17 01:00:00-04	OK	OK	51	1	
379	2019-07-24 00:00:00-04	2019-07-24 01:00:00-04	OK	OK	51	1	
380	2019-07-31 00:00:00-04	2019-07-31 01:00:00-04	OK	OK	51	1	
381	2019-08-07 00:00:00-04	2019-08-07 01:00:00-04	OK	OK	51	1	
382	2019-08-14 00:00:00-04	2019-08-14 01:00:00-04	OK	OK	51	1	
383	2019-08-21 00:00:00-04	2019-08-21 01:00:00-04	OK	OK	51	1	
384	2019-08-28 00:00:00-04	2019-08-28 01:00:00-04	OK	OK	51	1	
385	2019-09-04 00:00:00-04	2019-09-04 01:00:00-04	OK	OK	51	1	
386	2019-09-11 00:00:00-04	2019-09-11 01:00:00-04	OK	OK	51	1	
387	2019-09-18 00:00:00-04	2019-09-18 01:00:00-04	OK	OK	51	1	
388	2019-09-25 00:00:00-04	2019-09-25 01:00:00-04	OK	OK	51	1	
389	2019-10-02 00:00:00-04	2019-10-02 01:00:00-04	OK	OK	51	1	
390	2019-10-09 00:00:00-04	2019-10-09 01:00:00-04	OK	OK	51	1	
391	2018-11-14 15:00:36.791-05	2018-11-14 17:00:36.791-05	Gates	G12	\N	1	
392	2018-11-18 12:00:00-05	2018-11-18 14:30:00-05	Gates	G14	\N	1	
393	2018-11-26 13:30:27.935-05	2018-11-26 14:30:27.935-05	Gates	461	\N	1	
394	2018-12-02 13:00:07.798-05	2018-12-02 14:00:07.798-05	Bad	news	\N	1	One
395	2018-12-02 13:00:24.403-05	2018-12-02 14:00:24.403-05	Here	now	\N	1	Two
396	2019-01-29 00:00:00-05	2019-01-29 23:30:00-05	Gates	G01	\N	2	
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
41	42
41	43
66	67
66	68
66	69
66	70
2	71
6	72
6	73
6	74
6	75
1	76
1	77
6	78
6	79
6	80
6	81
6	82
6	83
6	84
6	85
6	86
87	88
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY tags (tag_id, name, course_id, level, activated) FROM stdin;
3	Assignment 3	1	1	t
4	Assignment 4	1	1	f
5	Prelim	1	1	t
7	General	1	1	t
24	Logistics	1	2	t
25	Grading	1	2	t
26	Office Hours	1	2	f
27	Other	1	2	f
13	Q3	1	2	f
14	Q4	1	2	f
2	Assignment 2	1	1	t
11	Q1	1	2	t
12	Q2	1	2	f
71	Q5	1	2	t
76	Q4	1	2	t
1	Assignment 1	1	1	f
8	Q1	1	2	t
9	Q2	1	2	t
10	Q3	1	2	t
66	A11	1	1	t
67	Q1	1	2	t
68	Q2a	1	2	t
69	Q2b	1	2	t
70	Q3	1	2	t
41	A10	1	1	t
42	Q1	1	2	t
43	Q2	1	2	f
15	Q1a	1	2	t
16	Q1b	1	2	t
17	Q2	1	2	t
18	Written Part	1	2	t
19	Programming	1	2	t
20	Regrade	1	2	t
21	Feedback	1	2	t
77	Q4	1	2	t
6	Final	1	1	t
22	Regrade	1	2	t
23	Feedback	1	2	f
72	Debugging	1	2	t
73	Conceptual	1	2	t
74	Debugging	1	2	t
75	Conceptual	1	2	t
78	This is a long tag name	1	2	t
79	This is a long tag name	1	2	t
80	This is a long tag name	1	2	t
81	This is a long tag name	1	2	t
82	This is a long tag name	1	2	t
83	This is a long tag name	1	2	t
84	This is a long tag name	1	2	t
85	This is a long tag name	1	2	t
86	This is a long tag name	1	2	t
87	A1	2	1	t
88	Loops	2	2	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY users (user_id, email, google_id, first_name, last_name, created_at, last_activity_at, photo_url, display_name) FROM stdin;
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

SELECT pg_catalog.setval('courses_course_id_seq', 3, true);


--
-- Name: questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('questions_question_id_seq', 53, true);


--
-- Name: session_series_session_series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('session_series_session_series_id_seq', 51, true);


--
-- Name: sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('sessions_session_id_seq', 396, true);


--
-- Name: tags_tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('tags_tag_id_seq', 88, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('users_user_id_seq', 22, true);


--
-- Name: course_users course_users_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY course_users
    ADD CONSTRAINT course_users_pk PRIMARY KEY (course_id, user_id);


--
-- Name: courses courses_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY courses
    ADD CONSTRAINT courses_pk PRIMARY KEY (course_id);


--
-- Name: question_tags question_tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY question_tags
    ADD CONSTRAINT question_tags_pk PRIMARY KEY (question_id, tag_id);


--
-- Name: questions questions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pk PRIMARY KEY (question_id);


--
-- Name: session_series session_series_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series
    ADD CONSTRAINT session_series_pk PRIMARY KEY (session_series_id);


--
-- Name: session_series_tas session_series_tas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series_tas
    ADD CONSTRAINT session_series_tas_pk PRIMARY KEY (session_series_id, user_id);


--
-- Name: session_tas session_tas_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_tas
    ADD CONSTRAINT session_tas_pk PRIMARY KEY (session_id, user_id);


--
-- Name: sessions sessions_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pk PRIMARY KEY (session_id);


--
-- Name: tag_relations tag_relations_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tag_relations
    ADD CONSTRAINT tag_relations_pk PRIMARY KEY (parent_id, child_id);


--
-- Name: tags tags_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pk PRIMARY KEY (tag_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_googleid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_googleid_key UNIQUE (google_id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pk PRIMARY KEY (user_id);


--
-- Name: courses after_insert_course; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_insert_course AFTER INSERT ON courses FOR EACH ROW EXECUTE PROCEDURE trigger_after_insert_course();


--
-- Name: questions before_update_question; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER before_update_question BEFORE UPDATE ON questions FOR EACH ROW EXECUTE PROCEDURE trigger_before_update_question();


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
-- Name: session_series session_series_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series
    ADD CONSTRAINT session_series_fk0 FOREIGN KEY (course_id) REFERENCES courses(course_id);


--
-- Name: session_series_tas session_series_tas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series_tas
    ADD CONSTRAINT session_series_tas_fk0 FOREIGN KEY (session_series_id) REFERENCES session_series(session_series_id);


--
-- Name: session_series_tas session_series_tas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_series_tas
    ADD CONSTRAINT session_series_tas_fk1 FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: session_tas session_tas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_tas
    ADD CONSTRAINT session_tas_fk0 FOREIGN KEY (session_id) REFERENCES sessions(session_id);


--
-- Name: session_tas session_tas_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY session_tas
    ADD CONSTRAINT session_tas_fk1 FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: sessions sessions_fk0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_fk0 FOREIGN KEY (course_id) REFERENCES courses(course_id);


--
-- Name: sessions sessions_fk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_fk1 FOREIGN KEY (session_series_id) REFERENCES session_series(session_series_id);


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
-- Name: course_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE course_users ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

--
-- Name: session_series delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON session_series FOR DELETE TO backend USING (((( SELECT internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_series_tas delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON session_series_tas FOR DELETE TO backend USING (( SELECT internal_write_policy_series_ta(session_series_tas.session_series_id) AS internal_write_policy_series_ta));


--
-- Name: sessions delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON sessions FOR DELETE TO backend USING (((( SELECT internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_tas delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON session_tas FOR DELETE TO backend USING (( SELECT internal_write_policy_session_ta(session_tas.session_id) AS internal_write_policy_session_ta));


--
-- Name: tags delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON tags FOR DELETE TO backend USING ((( SELECT internal_get_user_role(tags.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: tag_relations delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON tag_relations FOR DELETE TO backend USING ((( SELECT internal_owns_tag(tag_relations.parent_id) AS internal_owns_tag) AND ( SELECT internal_owns_tag(tag_relations.child_id) AS internal_owns_tag)));


--
-- Name: question_tags delete_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY delete_policy ON question_tags FOR DELETE TO backend USING (( SELECT internal_owns_question(question_tags.question_id) AS internal_owns_question));


--
-- Name: users insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON users FOR INSERT TO backend WITH CHECK ((( SELECT internal_get_user_id() AS internal_get_user_id) = '-1'::integer));


--
-- Name: course_users insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON course_users FOR INSERT TO backend WITH CHECK ((role = 'student'::text));


--
-- Name: session_series insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON session_series FOR INSERT TO backend WITH CHECK (((( SELECT internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_series_tas insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON session_series_tas FOR INSERT TO backend WITH CHECK (( SELECT internal_write_policy_series_ta(session_series_tas.session_series_id) AS internal_write_policy_series_ta));


--
-- Name: sessions insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON sessions FOR INSERT TO backend WITH CHECK (((( SELECT internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_tas insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON session_tas FOR INSERT TO backend WITH CHECK (( SELECT internal_write_policy_session_ta(session_tas.session_id) AS internal_write_policy_session_ta));


--
-- Name: tags insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON tags FOR INSERT TO backend WITH CHECK ((( SELECT internal_get_user_role(tags.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: tag_relations insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON tag_relations FOR INSERT TO backend WITH CHECK ((( SELECT internal_owns_tag(tag_relations.parent_id) AS internal_owns_tag) AND ( SELECT internal_owns_tag(tag_relations.child_id) AS internal_owns_tag)));


--
-- Name: questions insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON questions FOR INSERT TO backend WITH CHECK (((asker_id = ( SELECT internal_get_user_id() AS internal_get_user_id)) AND ( SELECT internal_is_queue_open(questions.session_id) AS internal_is_queue_open)));


--
-- Name: question_tags insert_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_policy ON question_tags FOR INSERT TO backend WITH CHECK (( SELECT internal_owns_question(question_tags.question_id) AS internal_owns_question));


--
-- Name: question_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

--
-- Name: courses read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON courses FOR SELECT TO backend USING (true);


--
-- Name: users read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON users FOR SELECT TO backend USING (true);


--
-- Name: course_users read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON course_users FOR SELECT TO backend USING (true);


--
-- Name: session_series read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON session_series FOR SELECT TO backend USING (true);


--
-- Name: session_series_tas read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON session_series_tas FOR SELECT TO backend USING (true);


--
-- Name: sessions read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON sessions FOR SELECT TO backend USING (true);


--
-- Name: session_tas read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON session_tas FOR SELECT TO backend USING (true);


--
-- Name: tags read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON tags FOR SELECT TO backend USING (true);


--
-- Name: tag_relations read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON tag_relations FOR SELECT TO backend USING (true);


--
-- Name: question_tags read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON question_tags FOR SELECT TO backend USING (true);


--
-- Name: questions read_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_policy ON questions FOR SELECT TO backend USING (true);


--
-- Name: session_series; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE session_series ENABLE ROW LEVEL SECURITY;

--
-- Name: session_series_tas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE session_series_tas ENABLE ROW LEVEL SECURITY;

--
-- Name: session_tas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE session_tas ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: tag_relations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE tag_relations ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

--
-- Name: users update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON users FOR UPDATE TO backend USING ((user_id = ( SELECT internal_get_user_id() AS internal_get_user_id)));


--
-- Name: course_users update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON course_users FOR UPDATE TO backend USING ((( SELECT internal_get_user_role(course_users.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: session_series update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON session_series FOR UPDATE TO backend USING (((( SELECT internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT internal_get_user_role(session_series.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_series_tas update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON session_series_tas FOR UPDATE TO backend USING (( SELECT internal_write_policy_series_ta(session_series_tas.session_series_id) AS internal_write_policy_series_ta));


--
-- Name: sessions update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON sessions FOR UPDATE TO backend USING (((( SELECT internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'professor'::text) OR (( SELECT internal_get_user_role(sessions.course_id) AS internal_get_user_role) = 'ta'::text)));


--
-- Name: session_tas update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON session_tas FOR UPDATE TO backend USING (( SELECT internal_write_policy_session_ta(session_tas.session_id) AS internal_write_policy_session_ta));


--
-- Name: tags update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON tags FOR UPDATE TO backend USING ((( SELECT internal_get_user_role(tags.course_id) AS internal_get_user_role) = 'professor'::text));


--
-- Name: tag_relations update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON tag_relations FOR UPDATE TO backend USING ((( SELECT internal_owns_tag(tag_relations.parent_id) AS internal_owns_tag) AND ( SELECT internal_owns_tag(tag_relations.child_id) AS internal_owns_tag)));


--
-- Name: questions update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON questions FOR UPDATE TO backend USING (( SELECT internal_owns_question(questions.question_id) AS internal_owns_question));


--
-- Name: question_tags update_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_policy ON question_tags FOR UPDATE TO backend USING (( SELECT internal_owns_question(question_tags.question_id) AS internal_owns_question));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO backend;


--
-- Name: TABLE questions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE questions TO backend;


--
-- Name: TABLE tags; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE tags TO backend;


--
-- Name: TABLE session_series; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE session_series TO backend;


--
-- Name: TABLE sessions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE sessions TO backend;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE users TO backend;


--
-- Name: TABLE course_users; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE course_users TO backend;


--
-- Name: TABLE courses; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE courses TO backend;


--
-- Name: SEQUENCE courses_course_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE courses_course_id_seq TO backend;


--
-- Name: TABLE question_tags; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE question_tags TO backend;


--
-- Name: SEQUENCE questions_question_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE questions_question_id_seq TO backend;


--
-- Name: SEQUENCE session_series_session_series_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE session_series_session_series_id_seq TO backend;


--
-- Name: TABLE session_series_tas; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE session_series_tas TO backend;


--
-- Name: TABLE session_tas; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE session_tas TO backend;


--
-- Name: SEQUENCE sessions_session_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE sessions_session_id_seq TO backend;


--
-- Name: TABLE tag_relations; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE tag_relations TO backend;


--
-- Name: SEQUENCE tags_tag_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE tags_tag_id_seq TO backend;


--
-- Name: SEQUENCE users_user_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT USAGE ON SEQUENCE users_user_id_seq TO backend;


--
-- PostgreSQL database dump complete
--

