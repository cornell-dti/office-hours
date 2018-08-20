DROP POLICY insert_policy ON public.question_tags;
CREATE POLICY insert_policy ON public.question_tags FOR INSERT TO backend WITH CHECK (( SELECT public.internal_owns_question(question_id) AS internal_owns_question));

DROP POLICY update_policy ON public.question_tags;
CREATE POLICY update_policy ON public.question_tags FOR UPDATE TO backend USING (( SELECT public.internal_owns_question(question_id) AS internal_owns_question));

DROP POLICY delete_policy ON public.question_tags;
CREATE POLICY delete_policy ON public.question_tags FOR DELETE TO backend USING (( SELECT public.internal_owns_question(question_id) AS internal_owns_question));