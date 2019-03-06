ALTER TABLE questions ADD COLUMN location text;

DROP FUNCTION public.api_add_question;

CREATE FUNCTION public.api_add_question(_content text, _status text, _session_id integer, _tags integer[], _location text) RETURNS SETOF public.questions
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