PGDMP     4                    v            chilli    10.2    10.2 >    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                       false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            �           1262    16405    chilli    DATABASE     x   CREATE DATABASE chilli WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
    DROP DATABASE chilli;
             postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             postgres    false            �           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                  postgres    false    3                        3079    12281    plpgsql 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
    DROP EXTENSION plpgsql;
                  false            �           0    0    EXTENSION plpgsql    COMMENT     @   COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
                       false    1            �            1259    16433    course_users    TABLE     j   CREATE TABLE course_users (
    course_id integer NOT NULL,
    user_id text NOT NULL,
    status text
);
     DROP TABLE public.course_users;
       public         postgres    false    3            �            1259    16408    courses    TABLE     j   CREATE TABLE courses (
    course_id integer NOT NULL,
    code text,
    name text,
    semester text
);
    DROP TABLE public.courses;
       public         postgres    false    3            �            1259    16406    courses_course_id_seq    SEQUENCE     �   CREATE SEQUENCE courses_course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.courses_course_id_seq;
       public       postgres    false    197    3            �           0    0    courses_course_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE courses_course_id_seq OWNED BY courses.course_id;
            public       postgres    false    196            �            1259    16507    question_followers    TABLE     b   CREATE TABLE question_followers (
    question_id integer NOT NULL,
    follower text NOT NULL
);
 &   DROP TABLE public.question_followers;
       public         postgres    false    3            �            1259    16541    question_tags    TABLE     ^   CREATE TABLE question_tags (
    tag_id integer NOT NULL,
    question_id integer NOT NULL
);
 !   DROP TABLE public.question_tags;
       public         postgres    false    3            �            1259    16487 	   questions    TABLE     �   CREATE TABLE questions (
    question_id integer NOT NULL,
    value text,
    time_entered timestamp without time zone DEFAULT now(),
    status text,
    time_resolved timestamp without time zone,
    session_id integer,
    student text
);
    DROP TABLE public.questions;
       public         postgres    false    3            �            1259    16485    questions_question_id_seq    SEQUENCE     �   CREATE SEQUENCE questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.questions_question_id_seq;
       public       postgres    false    204    3            �           0    0    questions_question_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE questions_question_id_seq OWNED BY questions.question_id;
            public       postgres    false    203            �            1259    16467    session_tas    TABLE     T   CREATE TABLE session_tas (
    session_id integer NOT NULL,
    ta text NOT NULL
);
    DROP TABLE public.session_tas;
       public         postgres    false    3            �            1259    16453    sessions    TABLE     �   CREATE TABLE sessions (
    session_id integer NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    location text,
    course_id integer
);
    DROP TABLE public.sessions;
       public         postgres    false    3            �            1259    16451    sessions_session_id_seq    SEQUENCE     �   CREATE SEQUENCE sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.sessions_session_id_seq;
       public       postgres    false    3    201            �           0    0    sessions_session_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE sessions_session_id_seq OWNED BY sessions.session_id;
            public       postgres    false    200            �            1259    16527    tags    TABLE     Z   CREATE TABLE tags (
    tag_id integer NOT NULL,
    value text,
    course_id integer
);
    DROP TABLE public.tags;
       public         postgres    false    3            �            1259    16525    tags_tag_id_seq    SEQUENCE     �   CREATE SEQUENCE tags_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.tags_tag_id_seq;
       public       postgres    false    3    207            �           0    0    tags_tag_id_seq    SEQUENCE OWNED BY     5   ALTER SEQUENCE tags_tag_id_seq OWNED BY tags.tag_id;
            public       postgres    false    206            �            1259    16417    users    TABLE     ?   CREATE TABLE users (
    netid text NOT NULL,
    name text
);
    DROP TABLE public.users;
       public         postgres    false    3                       2604    16411    courses course_id    DEFAULT     h   ALTER TABLE ONLY courses ALTER COLUMN course_id SET DEFAULT nextval('courses_course_id_seq'::regclass);
 @   ALTER TABLE public.courses ALTER COLUMN course_id DROP DEFAULT;
       public       postgres    false    197    196    197                       2604    16490    questions question_id    DEFAULT     p   ALTER TABLE ONLY questions ALTER COLUMN question_id SET DEFAULT nextval('questions_question_id_seq'::regclass);
 D   ALTER TABLE public.questions ALTER COLUMN question_id DROP DEFAULT;
       public       postgres    false    204    203    204                       2604    16456    sessions session_id    DEFAULT     l   ALTER TABLE ONLY sessions ALTER COLUMN session_id SET DEFAULT nextval('sessions_session_id_seq'::regclass);
 B   ALTER TABLE public.sessions ALTER COLUMN session_id DROP DEFAULT;
       public       postgres    false    200    201    201                       2604    16530    tags tag_id    DEFAULT     \   ALTER TABLE ONLY tags ALTER COLUMN tag_id SET DEFAULT nextval('tags_tag_id_seq'::regclass);
 :   ALTER TABLE public.tags ALTER COLUMN tag_id DROP DEFAULT;
       public       postgres    false    207    206    207            �          0    16433    course_users 
   TABLE DATA               ;   COPY course_users (course_id, user_id, status) FROM stdin;
    public       postgres    false    199   �D       �          0    16408    courses 
   TABLE DATA               ;   COPY courses (course_id, code, name, semester) FROM stdin;
    public       postgres    false    197   �D       �          0    16507    question_followers 
   TABLE DATA               <   COPY question_followers (question_id, follower) FROM stdin;
    public       postgres    false    205   E       �          0    16541    question_tags 
   TABLE DATA               5   COPY question_tags (tag_id, question_id) FROM stdin;
    public       postgres    false    208   *E       �          0    16487 	   questions 
   TABLE DATA               j   COPY questions (question_id, value, time_entered, status, time_resolved, session_id, student) FROM stdin;
    public       postgres    false    204   GE       �          0    16467    session_tas 
   TABLE DATA               .   COPY session_tas (session_id, ta) FROM stdin;
    public       postgres    false    202   uE       �          0    16453    sessions 
   TABLE DATA               R   COPY sessions (session_id, start_time, end_time, location, course_id) FROM stdin;
    public       postgres    false    201   �E       �          0    16527    tags 
   TABLE DATA               1   COPY tags (tag_id, value, course_id) FROM stdin;
    public       postgres    false    207   �E       �          0    16417    users 
   TABLE DATA               %   COPY users (netid, name) FROM stdin;
    public       postgres    false    198   �E       �           0    0    courses_course_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('courses_course_id_seq', 1, false);
            public       postgres    false    196            �           0    0    questions_question_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('questions_question_id_seq', 3, true);
            public       postgres    false    203            �           0    0    sessions_session_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('sessions_session_id_seq', 1, false);
            public       postgres    false    200            �           0    0    tags_tag_id_seq    SEQUENCE SET     7   SELECT pg_catalog.setval('tags_tag_id_seq', 1, false);
            public       postgres    false    206            "           2606    16440    course_users course_users_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY course_users
    ADD CONSTRAINT course_users_pkey PRIMARY KEY (course_id, user_id);
 H   ALTER TABLE ONLY public.course_users DROP CONSTRAINT course_users_pkey;
       public         postgres    false    199    199                       2606    16416    courses courses_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_id);
 >   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_pkey;
       public         postgres    false    197            *           2606    16514 *   question_followers question_followers_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY question_followers
    ADD CONSTRAINT question_followers_pkey PRIMARY KEY (question_id, follower);
 T   ALTER TABLE ONLY public.question_followers DROP CONSTRAINT question_followers_pkey;
       public         postgres    false    205    205            .           2606    16545     question_tags question_tags_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY question_tags
    ADD CONSTRAINT question_tags_pkey PRIMARY KEY (tag_id, question_id);
 J   ALTER TABLE ONLY public.question_tags DROP CONSTRAINT question_tags_pkey;
       public         postgres    false    208    208            (           2606    16496    questions questions_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);
 B   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_pkey;
       public         postgres    false    204            &           2606    16474    session_tas session_tas_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY session_tas
    ADD CONSTRAINT session_tas_pkey PRIMARY KEY (session_id, ta);
 F   ALTER TABLE ONLY public.session_tas DROP CONSTRAINT session_tas_pkey;
       public         postgres    false    202    202            $           2606    16461    sessions sessions_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (session_id);
 @   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_pkey;
       public         postgres    false    201            ,           2606    16535    tags tags_pkey 
   CONSTRAINT     I   ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag_id);
 8   ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_pkey;
       public         postgres    false    207                        2606    16424    users users_pkey 
   CONSTRAINT     J   ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (netid);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public         postgres    false    198            /           2606    16441 (   course_users course_users_course_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY course_users
    ADD CONSTRAINT course_users_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(course_id);
 R   ALTER TABLE ONLY public.course_users DROP CONSTRAINT course_users_course_id_fkey;
       public       postgres    false    199    2078    197            0           2606    16446 &   course_users course_users_user_id_fkey    FK CONSTRAINT     z   ALTER TABLE ONLY course_users
    ADD CONSTRAINT course_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(netid);
 P   ALTER TABLE ONLY public.course_users DROP CONSTRAINT course_users_user_id_fkey;
       public       postgres    false    198    199    2080            7           2606    16520 3   question_followers question_followers_follower_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY question_followers
    ADD CONSTRAINT question_followers_follower_fkey FOREIGN KEY (follower) REFERENCES users(netid);
 ]   ALTER TABLE ONLY public.question_followers DROP CONSTRAINT question_followers_follower_fkey;
       public       postgres    false    2080    198    205            6           2606    16515 6   question_followers question_followers_question_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY question_followers
    ADD CONSTRAINT question_followers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(question_id);
 `   ALTER TABLE ONLY public.question_followers DROP CONSTRAINT question_followers_question_id_fkey;
       public       postgres    false    205    2088    204            :           2606    16551 ,   question_tags question_tags_question_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY question_tags
    ADD CONSTRAINT question_tags_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(question_id);
 V   ALTER TABLE ONLY public.question_tags DROP CONSTRAINT question_tags_question_id_fkey;
       public       postgres    false    204    208    2088            9           2606    16546 '   question_tags question_tags_tag_id_fkey    FK CONSTRAINT     z   ALTER TABLE ONLY question_tags
    ADD CONSTRAINT question_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags(tag_id);
 Q   ALTER TABLE ONLY public.question_tags DROP CONSTRAINT question_tags_tag_id_fkey;
       public       postgres    false    2092    208    207            4           2606    16497 #   questions questions_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id);
 M   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_session_id_fkey;
       public       postgres    false    204    2084    201            5           2606    16502     questions questions_student_fkey    FK CONSTRAINT     t   ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_student_fkey FOREIGN KEY (student) REFERENCES users(netid);
 J   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_student_fkey;
       public       postgres    false    204    2080    198            2           2606    16475 '   session_tas session_tas_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY session_tas
    ADD CONSTRAINT session_tas_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id);
 Q   ALTER TABLE ONLY public.session_tas DROP CONSTRAINT session_tas_session_id_fkey;
       public       postgres    false    202    201    2084            3           2606    16480    session_tas session_tas_ta_fkey    FK CONSTRAINT     n   ALTER TABLE ONLY session_tas
    ADD CONSTRAINT session_tas_ta_fkey FOREIGN KEY (ta) REFERENCES users(netid);
 I   ALTER TABLE ONLY public.session_tas DROP CONSTRAINT session_tas_ta_fkey;
       public       postgres    false    2080    202    198            1           2606    16462     sessions sessions_course_id_fkey    FK CONSTRAINT     |   ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(course_id);
 J   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_course_id_fkey;
       public       postgres    false    197    201    2078            8           2606    16536    tags tags_course_id_fkey    FK CONSTRAINT     t   ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(course_id);
 B   ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_course_id_fkey;
       public       postgres    false    2078    197    207            �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x�3��H���CF\F���	��qqq 9w�      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     