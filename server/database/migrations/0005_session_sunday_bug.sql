DROP FUNCTION public.internal_create_sessions_from_series;

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