# Database Documentation
This document provides detailed descriptions of the PostgreSQL database schema being used for the project, including column-level specifications and function specifications. **Whenever the schema is changed, this document should be updated in the _same_ PR!**

## Tables
|Table|Description|
|----|-----------|
|[courses](#courses)|Instances of specific course offerings that are using Queue Me In|
|[users](#users)|Record of all registered users|
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
|🔑✈️|course\_id|integer|❌|References the course being described in this relation; forms a primary key with user\_id; foreign key from [courses](#courses)|
|🔑✈️|user_id|integer|❌|References the user being described in this relation; forms a primary key with course\_id; foreign key from [users](#users)|
||role|text|❌|One of 'professor', 'ta', or 'student', describing the user's role within the course|

### session-series
This relation is used to store metadata about weekly recurring office hour sessions. These recurring sessions are referred to as a 'series'. The series stored in this table do not represent actual sessions! Session instances are always stored in [sessions](#sessions) only.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|session\_series\_id|integer|❌|Auto-incrementing id assigned to each session series|
||start\_time|timestamp without time zone|❌|Represents the weekly start time and day of the series; the actual date is discarded and does not matter!|
||end\_time|timestamp without time zone|❌|Represents the weekly end time and day of the series; the actual date is discarded and does not matter!|
||building|text|❌|Name of the building in which this series occurs (eg. 'Gates')|
||room|text|❌|Name of the room in which this series occurs (eg. 'G17')|
|✈️|course\_id|integer|❌|References the course to which this session series belongs; foreign key from [courses](#courses)|

### session-series-tas
This is a junction table (many-to-many relationship) between [session_series](#session-series) and [users](#users) that describes the TAs that host a particular session series. Note that it is possible for sessions to be hosted by multiple TAs.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|session\_series\_id|integer|❌|References the session series whose host TA is being described; forms a primary key with user\_id; foreign key from [session_series](#session-series)|
|🔑✈️|user\_id|integer|❌|References the user who is the host TA for the session series; forms a primary key with session\_series\_id; foreign key from [users](#users)|

### sessions
This relation is used to store metadata about office hour session instances. Note that session instances may be part of a session series, or they may be independent sessions. This is dictated by whether or not the session\_series\_id field is null. Even if the session is part of a session series, all the metadata will be stored here in a replicated manner. If a session from a series is edited in a one-off, indepedent manner, then session\_series\_id will be set to null to prevent it from being affected by series edits.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|session\_id|integer|❌|Auto-incrementing id assigned to each session|
||start\_time|timestamp without time zone|❌|Timestamp at which this particular session is to start|
||end\_time|timestamp without time zone|❌|Timestamp at which this particular session is to end|
||building|text|❌|Name of the building in which this session occurs (eg. 'Gates')|
||room|text|❌|Name of the room in which this series occurs (eg. 'G17')|
|✈️|session\_series\_id|integer|✔️|References the session series to which this session belongs, if any; foreign key from [session_series](#session-series)|
|✈️|course\_id|integer|❌|References the course to which this session series belongs; foreign key from [courses](#courses)|

### session-tas
This is a junction table (many-to-many relationship) between [sessions](#sessions) and [users](#users) that describes the TAs that host a particular session instance. Note that it is possible for session instances to be hosted by multiple TAs. In case a session belongs to a series, the information from [session\_series\_tas](#session-series-tas) is stored here in a replicated manner.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|session\_id|integer|❌|References the session whose host TA is being described; forms a primary key with user\_id; foreign key from [sessions](#sessions)|
|🔑✈️|user\_id|integer|❌|References the user who is the host TA for the session; forms a primary key with session\_id; foreign key from [users](#users)|

### questions
This table contains all the details about all the questions asked across different sessions and courses. As the question's status is updated, its corresponding entry's 'status' field is changed. 

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|question\_id|integer|❌|Auto-incrementing id assigned to each question|
||content|text|❌|Text content of the question; character limit is imposed by the client|
||time_entered|timestamp without time zone|❌|Timestamp at which this question was first entered into the database; it defaults to the current timestamp if not provided|
||status|text|❌|Text that represents the current status of the question (eg. 'unresolved', 'resolved', 'noshow', 'retracted' are currently used values)|
||time_resolved|timestamp without time zone|✔️|Timestamp at which this question was marked as resolved or as a no-show|
||session\_id|integer|❌|References the session instance in which this question was asked; foreign key from [sessions](#sessions)|
||asker\_id|integer|❌|References the student (user) who asked this question; foreign key from [users](#users)|
||answerer\_id|integer|✔️|References the TA (user) who marked this question as resolved or as a no-show; foreign key from [users](#users)|

### tags
This relation is a repository of all the tags stored in the system, across different course offerings. Note that two tags in the same course with the same name should be separated if they are fundamentally different entities that need different analytics. For example, Q1 under Assignment 1 and Q1 under Assignment 2 should be separated as two tags, since they are to be analyzed independently.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|tag\_id|integer|❌|Auto-incrementing id assigned to each tag|
||name|text|❌|Name of the tag that is shown to the client|
|✈️|course\_id|integer|❌|The course offering to which this tag belongs; foreign key from [courses](#courses)|
||level|integer|❌|Encodes the tag level in the tag hierarchy: primary = 1, secondary = 2|

### tag-relations
Describes the tree-like tag hierarchy using parent-child relationships. Each entry in the table describes a parent tag and a child tag. 

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|parent\_id|integer|❌|tag\_id of the parent; forms a primary key with child\_id; foreign key from [tags](#tags)|
|🔑✈️|child\_id|integer|❌|tag\_id of the child; forms a primary key with parent\_id; foreign key from [tags](#tags)|

### question-tags
Junction table (many-to-many relationship) between [questions](#questions) and [tags](#tags) that attaches tags to questions.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|question\_id|integer|❌|question\_id of the question that is tagged with tag\_id; forms a primary key with tag\_id; foreign key from [questions](#questions)|
|🔑✈️|tag\_id|integer|❌|tag\_id of the tag that is to be attached to question\_id; forms a primary key with question\_id; foreign key from [tags](#tags)|

## Functions

In addition to the above tables, the following functions have been implemented in PL/pgSQL and are made available in GraphQL by Postgraphile. In most cases that involve multiple GraphQL queries from the client, or complex business logic, it is better to factor the complexity out into the API itself by exposing functions at the database level.

### add-question-with-tags
Inserts a new question into the database, and attaches the provided tags to it. This is complex to do on the client side without a function since it would require a query per tag association.

#### Parameters
- content (text): text body of the question
- status (text): initial status of the question
- session\_id (integer): id of the session to which the question belongs
- asker\_id (integer): id of the student (user) who asked the question
- tags (integer[]): list of tag ids to be associated with the question

#### Returns
All fields of the newly inserted question in the [questions](#questions) table.


### create-sessions-from-session-series
Given a session series, this function creates weekly session instances for it, for the duration of the course. If session instances for the specified series already exist, the function will throw an error. It is meant to be called only once, when the session series is created.

#### Parameters
- series (integer): series\_id for the session series whose sessions are to be instantiated

#### Returns
All fields of the newly inserted sessions in the [sessions](#sessions) table.