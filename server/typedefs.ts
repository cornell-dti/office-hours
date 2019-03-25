import { gql } from 'apollo-server-express';

const typeDefs = gql`

type User {
    user_id: ID
    email: String
    google_id: ID
    first_name: String
    last_name: String
    created_at: String
    last_activity_at: String
    photo_url: String
    display_name: String
}

type Course {
    course_id: ID
    code: String
    name: String
    start_date: String
    end_date: String
    queue_open_interval: String
    char_limit: Int
}

type Course_user {
    course_id: Course
    user_id: User
    role: String
}

type Session_series {
    session_series_id: ID
    start_time: String
    end_time: String
    building: String
    room: String
    course_id: Course
    title: String
}

type Session_series_ta {
    session_series_id: Session_series
    user_id: User
}

type Session {
    session_id: ID
    start_time: String
    end_time: String
    building: String
    room: String
    session_series_id: Session_series
    course_id: Course
    title: String
}

type Session_ta {
    session_id: Session
    user_id: User
}

type Tag {
    tag_id: ID
    name: String
    course_id: Course
    level: Int
    activated: Boolean
}

type Tag_relation {
    parent_id: Tag
    child_id: Tag
}

type Question {
    question_id: ID
    content: String
    time_entered: String
    status: String
    time_addressed: String
    session_id: Session
    asker_id: User
    answerer_id: User
    location: String
}

type Question_tag {
    question_id: Question
    tag_id: Tag
}


type Query {
    hello: String
}
`

export default [typeDefs];
