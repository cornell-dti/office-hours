ALTER TABLE sessions ADD COLUMN title text;
ALTER TABLE session_series ADD COLUMN title text;

DROP FUNCTION public.api_create_series;
DROP FUNCTION public.api_edit_series;
DROP FUNCTION public.api_create_session;
DROP FUNCTION public.api_edit_session;

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
