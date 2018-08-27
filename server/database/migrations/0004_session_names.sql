ALTER TABLE sessions ADD COLUMN title text;
ALTER TABLE session_series ADD COLUMN title text;

DROP FUNCTION public.api_create_series;
DROP FUNCTION public.api_edit_series;
DROP FUNCTION public.api_create_session;
DROP FUNCTION public.api_edit_session;
DROP FUNCTION public.internal_create_sessions_from_series;
DROP FUNCTION public.internal_sync_series_sessions;

CREATE FUNCTION public.api_create_series(_start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _course_id integer, _tas integer[], _title text) RETURNS SETOF public.session_series
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


CREATE FUNCTION public.api_edit_series(_series_id integer, _start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _tas integer[], _title text) RETURNS SETOF public.session_series
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

CREATE FUNCTION public.api_create_session(_start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _course_id integer, _tas integer[], _title text) RETURNS SETOF public.sessions
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

CREATE FUNCTION public.api_edit_session(_session_id integer, _start_time timestamp with time zone, _end_time timestamp with time zone, _building text, _room text, _tas integer[], _title text) RETURNS SETOF public.sessions
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
session_end_offset := session_end_time - date_trunc('week', session_end_time) ;
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


CREATE FUNCTION public.internal_sync_series_sessions(_series_id integer) RETURNS void
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
