# Database Documentation
This document provides detailed descriptions of the PostgreSQL database schema being used for the project, including column-level specifications and function specifications. **Whenever the schema is changed, this document should be updated in the _same_ PR!**

## Symbols
|Symbol|Description|
|---|---|
|🔑|Primary Key|
|⭐️|Unique Key|
|✈️|Foreign Key|
|❌|Not Null|
|✔️|Nullable|

## Tables
|Table|Description|
|----|-----------|
|[courses](#courses)|Instances of specific course offerings that are using Queue Me In|
|[users](#users)|Record of all registered users|
|[course\_users](#course-users)|Junction table between [courses](#courses) and [users](#users) that describes user roles within each course|
|[session\_series](#session-series)|Describes recurring office hour sessions (does not correspond to actual sessions)|
|[session\_series\_tas](#session-series-tas)|Lists the users that are hosting a particular session series|
|[sessions](#sessions)|Contains specific instances of office hour sessions|
|[session\_tas](#session-tas)|Lists the users that are hosting a particular session instance|
|[questions](#questions)|Record of every question asked, complete with metadata and the current status|
|[tags](#tags)|Repository of all tags stored within the system|
|[tag\_relations](#tag-relations)|Describes the hierarchy of tags contained in [tags](#tags)|
|[question\_tags](#question-tags)|Junction table between [questions](#questions) and [tags](#tags) that stores the tags associated with each question|

### courses
Each row in courses represents a specific course offering that is using Queue Me In. It includes metadata about the course, described below. Note that if the same course is using Queue Me In over different semesters, each semester must have a new entry.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|course\_id|integer|❌|Auto-incrementing id assigned to each course offering|
||code|text|❌|Shorthand name for the course, for example 'CS 3110'|
||name|text|❌|Expanded name for the course, for example 'Functional Programming'|
||semester|text|❌|Shorthand reference to the semester the course occurs in, for example 'SP18' or 'FA18'|
||start\_date|date|❌|Date on which office hours for this course are to start|
||end\_date|date|❌|Date on which office hours for this course are to end|

### users
All the registered users are logged to this table after their first login. This schema assumes that Google login is the authentication method. Note that some of the fields are nullable because they might not have been set in the user's Google profile.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|user\_id|integer|❌|Auto-incrementing id assigned to each user|
|⭐️|email|text|❌|Email address that the user used to log in; this will generally be an @cornell.edu address, but is not guaranteed to be one|
|⭐️|google\_id|text|❌|Google-assigned unique id of this user, provided by Google on login|
||first\_name|text|✔️|Google-provided first name of the user (note: may not be set in their Google profile, in which case this is null)|
||last\_name|text|✔️|Google-provided last name of the user (note: may not be set in their Google profile, in which case this is null)|
||created\_at|timestamp without time zone|✔️|Timestamp at which this user record was first created|
||last\_activity\_at|timestamp without time zone|✔️|Timestamp at which the last activity on Queue Me In from this user was logged|
||photo\_url|text|✔️|Google-provided profile photo URL of the user (note: may not be set in their Google profile, in which case this is null)|

### course-users
This relation is used to store user roles within courses. It is a junction table (many-to-many relationship) between courses and users, and each entry is assigned a role indicating the user's permissions within the course. If a course-user pair does not occur in this table, it is assumed that the user is not a part of the course in any capacity.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|course\_id|integer|❌|References the course being described in this relation; forms a primary key with user\_id; foreign key from [courses](#courses)|
|🔑✈️|user\_id|integer|❌|References the user being described in this relation; forms a primary key with course\_id; foreign key from [users](#users)|
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
This is a junction table (many-to-many relationship) between [session\_series](#session-series) and [users](#users) that describes the TAs that host a particular session series. Note that it is possible for sessions to be hosted by multiple TAs.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|session\_series\_id|integer|❌|References the session series whose host TA is being described; forms a primary key with user\_id; foreign key from [session\_series](#session-series)|
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
|✈️|session\_series\_id|integer|✔️|References the session series to which this session belongs, if any; foreign key from [session\_series](#session-series)|
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
||time\_entered|timestamp without time zone|❌|Timestamp at which this question was first entered into the database; it defaults to the current timestamp if not provided|
||status|text|❌|Text that represents the current status of the question (eg. 'unresolved', 'resolved', 'noshow', 'retracted' are currently used values)|
||time\_addressed|timestamp without time zone|✔️|Timestamp at which this question was most recently marked as resolved or as a no-show|
||session\_id|integer|❌|References the session instance in which this question was asked; foreign key from [sessions](#sessions)|
||asker\_id|integer|❌|References the student (user) who asked this question; foreign key from [users](#users)|
||answerer\_id|integer|✔️|References the TA (user) who most recently marked this question as resolved or as a no-show; foreign key from [users](#users)|

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

In addition to the above tables, the following functions have been implemented in PL/pgSQL and are made available in GraphQL by Postgraphile. In most cases that involve multiple GraphQL queries from the client, or complex business logic, it is better to factor the complexity out into the API itself by exposing functions at the database level. The functions implemented in PL/pgSQL are made available to the client by Postgraphile. Note that some functions are designed to be called directly from the client (prefixed by 'api'), while the others should not be called directly (prefixed by 'internal').

### API Functions
Functions that are designed to be exposed to the client directly are prefixed with 'api'. Please read this documentation before using those functions!  

#### Sessions / Series API
To deal with the intricate logic involving sessions, session series, and their creation/mutation/deletion, the following functions have been implemented. **To mutate either one-off indepedent sessions, or a series of sessions, this API must be used rather than direct mutations of the entities. Otherwise, the data will be inconsistent.** For all of these functions, please always provide _all_ of the parameters.

#### api\_create\_series

##### Description
Given all the details of a new weekly-recurring session series, this function will update the database to include the series metadata and will create session instances for the series. Session instances are only created if they end after the current time, and if their start time lies between the course's start and end dates (inclusive).

##### Parameters
- \_start\_time (timestamp without time zone): contains the weekly start day and time of this series; the actual date in this timestamp does not matter!
- \_end\_time (timestamp without time zone): contains the weekly end day and time of this series; the actual date in this timestamp does not matter!
- \_building (text): the name of the building in which the recurring session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the recurring session will take place (eg. 'G11')
- \_course\_id (integer): the id of the course to which this session series is to be added
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session series

##### Returns
All the fields of the newly inserted row in the [session\_series](#session-series) table

#### api\_edit\_series

##### Description
Given updated details of an existing weekly-recurring session series, this function will update the database to include the new series metadata and will update the session instances for the series with the new details. Session instances are only edited if they have not yet ended. Sessions in the series that have already ended remain untouched.

##### Parameters
- \_series\_id (integer): the id of the session series to be edited
- \_start\_time (timestamp without time zone): contains the weekly start day and time of this series; the actual date in this timestamp does not matter!
- \_end\_time (timestamp without time zone): contains the weekly end day and time of this series; the actual date in this timestamp does not matter!
- \_building (text): the name of the building in which the recurring session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the recurring session will take place (eg. 'G11')
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session series

##### Returns
All the fields of the updated row in the [session\_series](#session-series) table

#### api\_delete\_series

##### Description
This function deletes all the metadata and upcoming session instances of a given session series. Only session instances that have not yet started will be deleted. The other session instances will remain untouched, except their session\_series\_id will be set to NULL indicating that they are no longer owned by a session series. The records for the series in [session\_series](#session-series) and (session\_series\_tas)[#session-series-tas] are removed.

##### Parameters
- \_series\_id (integer): the id of the session series to be deleted

##### Returns
Nothing (void)

#### api\_create\_session

##### Description
Given all the details of a new non-recurring (/independent/one-off) session, this function will create the session instance. The session will only be created if it has not ended yet. If the supplied end time has already passed, an exception will be thrown.

##### Parameters
- \_start\_time (timestamp without time zone): the exact time at which the session starts (date matters!)
- \_end\_time (timestamp without time zone): the exact time at which the session ends (date matters!)
- \_building (text): the name of the building in which the session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the session will take place (eg. 'G11')
- \_course\_id (integer): the id of the course to which this session is to be added
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session

##### Returns
All the fields of the newly inserted row in the [sessions](#sessions) table

#### api\_edit\_session

##### Description
Given updated details of an existing session, this function will edit the session instance to match the supplied details. The session will only be edited if it has not ended yet. If the supplied end time has already passed, an exception will be thrown. **Note: this function will also set session\_series\_id to NULL!** If one session from a session series is edited using this function, it will subsequently become indepedent of the series.

##### Parameters
- \_session\_id (integer): the id of the session to be edited
- \_start\_time (timestamp without time zone): the exact time at which the session starts (date matters!)
- \_end\_time (timestamp without time zone): the exact time at which the session ends (date matters!)
- \_building (text): the name of the building in which the session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the session will take place (eg. 'G11')
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session

##### Returns
All the fields of the updated row in the [sessions](#sessions) table

#### api\_delete\_session

##### Description
This function deletes a particular session instance. Only sessions that have not yet started are eligible for deletion. If the specified session has already started, an exception will be thrown.

##### Parameters
- \_session\_id (integer): the id of the session to be deleted

##### Returns
Nothing (void)

#### Other Useful Functions

#### api\_get\_sessions

##### Description
For a particular course, this function finds all the session instances that start within a specified time range. This is especially useful for the Calendar View, which needs to display all the sessions that start on a particular day. Currently, the schema generated by Postgraphile does not support range queries, so this function was necessary to implement inside Postgres.

##### Parameters
- \_course\_id (integer): the id of the course whose sessions are to be found
- \_begin\_time (timestamp without time zone): the beginning of the time range to be queried for (inclusive bound)
- \_end\_time (timestamp without time zone): the end of the time range to be queried for (inclusive bound)

##### Returns
All the fields from the [sessions](#sessions) table of all the sessions in the course whose start\_time lies between the supplied begin\_time and end\_time (both inclusive)

#### api\_add\_question

##### Description
Given the details of a user-submitted question, this function inserts the data into the backend. This function is necessary because without it, the client would have to make multiple calls (one for each tag) to associate tags with the question. This function abstracts away that logic and provides a simpler API to the client.

##### Parameters
- \_content (text): the user-submitted text content of the question
- \_status (text): the initial status of the question, see the (questions)(#questions) table for more details
- \_session\_id (integer): the id of the session in which the question is to be added
- \_asked\_id (integer): the user\_id of the student who submitted the question
- \_tags (integer[]): a list of tag\_ids that are to be associated with the question

##### Returns
All the fields of the newly-inserted row from the [questions](#questions) table

### Internal Functions
There are other functions in the database that are used only internally by the API functions. These are prefixed by 'internal', and **should never be called directly by the client**. Doing so will likely have strange side effects on the data.

#### internal\_create\_sessions\_from\_series

##### Description
Given a session series, this function instantiates session instances for it on a weekly recurring basis. Sessions are only added if they lie between the start and end date of the course that they are a part of. Additionally, sessions that have already ended are not added. The function is called internally by session series API, and it assumes that no sessions belonging to the series exist already. If such sessions exist, an exception is raised.

##### Parameters
- \_series\_id (integer): the id of the session series for which session instances are to be created

##### Returns
All the fields from the [sessions](#sessions) table of all the sessions that were instantiated by the function

#### internal\_sync\_series\_sessions

##### Description
Given a session series, this function updates its ongoing and upcoming weekly recurring session instances with the latest metadata of the series, including the host TAs. Only session instances in the series that have not yet ended are updated, while the others are left untouched. Note that the sessions are synced with the series data that lies in [session\_series](#session-series) and [session\_series\_tas](#session-series-tas) when this function is called. 

##### Parameters
- \_series\_id (integer): the id of the session series for which session instances are to be synced

##### Returns
Nothing (void)