# Database Documentation
This document provides detailed descriptions of the PostgreSQL database schema being used for the project, including column-level specifications and function specifications. **Whenever the schema is changed, this document should be updated in the _same_ PR!**

## Tables
|Table|Description|
|----|-----------|
|[courses](#courses)|Instances of specific course offerings that are using Queue Me In|
|[users](#users)|Record of registered users on Queue Me In|
|[course_users](#course-users)|Junction table between [courses](#courses) and [users](#users) that describes user roles within each course|
|[session_series](#session-series)|Describes recurring office hour sessions (does not correspond to actual sessions)|
|[session_series_tas](#session-series-tas)|Lists the users that are hosting a particular session series|
|[sessions](#sessions)|Contains specific instances of office hour sessions|
|[session_tas](#session-tas)|Lists the users that are hosting a particular session instance|
|[questions](#questions)|Record of every question asked, complete with metadata and the current status|
|[tags](#tags)|Repository of all tags stored within the system|
|[tag_relations](#tag-relations)|Describes the hierarchy of tags contained in [tags](#tags)|
|[question_tags](#question-tags)|Junction table between [questions](#questions) and [tags](#tags) that stores the tags associated with each question|

### courses
Each row in courses represents a specific course offering that is using Queue Me In. It includes metadata about the course, described below. Note that if the same course is using Queue Me In over different semesters, each semester must have a new entry.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|course_id|integer|❌|Auto-incrementing id assigned to each course offering|
||code|text|❌|Shorthand name for the course, for example 'CS 3110'|
||name|text|❌|Expanded name for the course, for example 'Functional Programming'|
||semester|text|❌|Shorthand reference to the semester the course occurs in, for example 'SP18' or 'FA18'|
||start_date|date|❌|Date on which office hours for this course are to start|
||end_date|date|❌|Date on which office hours for this course are to end|

### users
All the registered users are logged to this table after their first login. This schema assumes that Google login is the authentication method. Note that some of the fields are nullable because they might not have been set in the user's Google profile.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|user_id|integer|❌|Auto-incrementing id assigned to each user|
|⭐️|net_id|text|❌|Cornell-assigned NetID of this user, found by the prefix of the email address (for example, abc123@cornell.edu's NetID would be inferred as abc123)|
|⭐️|google_id|text|❌|Google-assigned unique id of this user, provided by Google on login|
||first_name|text|✔️|Google-provided first name of the user (note: may not be set in their Google profile, in which case this is null)|
||last_name|text|✔️|Google-provided last name of the user (note: may not be set in their Google profile, in which case this is null)|
||created_at|timestamp without time zone|✔️|Timestamp at which this user record was first created|
||last_activity_at|timestamp without time zone|✔️|Timestamp at which the last activity on Queue Me In from this user was logged|
||photo_url|text|✔️|Google-provided profile photo URL of the user (note: may not be set in their Google profile, in which case this is null)|

### course-users
This relation is used to store user roles within courses. It is a junction table (many-to-many relationship) between courses and users, and each entry is assigned a role indicating the user's permissions within the course.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|course\_id|integer|❌|References the course being described in this relation (forms a primary key with user\_id); _foreign key from [courses](#courses))_|
|🔑✈️|user_id|integer|❌|References the user being described in this relation (forms a primary key with course\_id); _foreign key from [users](#users))_|
||role|text|❌|One of 'professor', 'ta', or 'student', describing the user's role within the course|

## Functions