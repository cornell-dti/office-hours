CREATE FUNCTION public.api_update_course_user_role(
    _course_id integer,
    _user_id integer,
    _role text)
    RETURNS SETOF public.course_users
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
