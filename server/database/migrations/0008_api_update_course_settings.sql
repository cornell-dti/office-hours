CREATE POLICY update_policy ON public.courses FOR UPDATE TO backend USING ((( SELECT public.internal_get_user_role(courses.course_id) AS internal_get_user_role) = 'professor'::text));

CREATE FUNCTION public.api_update_course_settings(
    _course_id integer,
    _char_limit integer,
    _queue_open_interval interval)
    RETURNS SETOF public.courses
    LANGUAGE plpgsql
AS $$
    begin
        update courses set "char_limit" = _char_limit, "queue_open_interval" = _queue_open_interval where course_id = _course_id;
        return query (select * from courses where course_id = _course_id);
    end
$$;