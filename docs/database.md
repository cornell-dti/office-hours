# Database Documentation
This document provides detailed descriptions of the PostgreSQL database schema being used for the project, including column-level specifications and function specifications. **Whenever the schema is changed, this document should be updated in the _same_ PR!** It also includes a reference that details the flow of dumping and loading data from Postgres locally for testing purposes.

## Database Setup
Assuming you have PostgreSQL installed on your machine (we are currently using version 10), run the following from a terminal window to create a new database:

`createdb -h <HOST_NAME> -p <PORT> -U <USERNAME> <DATABASE_NAME>`

If running locally, the host name will be localhost, and the port and username will be the ones that you set while setting Postgres up. You will be prompted to enter the password for the username, and then an empty database will be created. Now, we need to use the `psql` command-line tool to load in the schema dump from [`/server/database/mock_database.sql`](../server/database/mock_database.sql):

`psql -h <HOST_NAME> -p <PORT> -U <USERNAME> <DATABASE_NAME> -f <PATH-TO-mock_database.sql>`

If you get foreign key constraint violations on doing this, it is because Postgres copies over the mock data in an order that doesn't respect the foreign key constraints. If this happens, enter the psql command-line tool and execute:

`SET session_replication_role = replica;`

Then, exit out of psql and execute the previous command. Finally, enter psql again and run:

`SET session_replication_role = DEFAULT;`

This will temporarily disable the foreign key constraint checks. ([Source](https://stackoverflow.com/questions/38112379/disable-postgresql-foreign-key-checks-for-migrations))

Finally, you can play around with the mock data by either using a database management tool ([DBeaver](https://dbeaver.io/) is a tried and tested one that works well, but there are many others) or through GraphiQL or the app! If you want to dump the changed database into a file that others can load, run the following command:

`pg_dump -h <HOST_NAME> -p <PORT> -U <USERNAME> --no-owner <DATABASE_NAME> > <OUTPUT_FILE.sql>`

This will create a dump the same way `mock_database.sql` was created. This file will include all the commands necessary to load in the entire schema, functions, and mock data into a new database.

If you'd like to reset your local database (for example, to sync it with the latest schema), first use the `dropdb` command from your terminal:

`dropdb -h <HOST_NAME> -p <PORT> -U <USERNAME> <DATABASE_NAME>`

And then load in the schema using the dump as described above (using `psql`).

### A note on timestamps
Wherever timestamps appear in the schema, we default to using the `timestamp with time zone` type, since it gives us consistency across clients in different time zones. Whenever providing timestamps to the database, please include the client's timezone! The most common way to do this is to format the timestamp string as an ISO 8601 string that includes the timezone offset.

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
||queue\_open\_interval|interval|❌|Amount of time that the queue is to be opened for before each session starts; for example '30 minutes' (which is the default)|
||char\_limit|integer|❌|Character limit for questions asked for the course|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|-|
|Update|-|
|Delete|-|

### users
All the registered users are logged to this table after their first login. This schema assumes that Google login is the authentication method. Note that some of the fields are nullable because they might not have been set in the user's Google profile.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|user\_id|integer|❌|Auto-incrementing id assigned to each user|
|⭐️|email|text|❌|Email address that the user used to log in; this will generally be an @cornell.edu address, but is not guaranteed to be one|
|⭐️|google\_id|text|❌|Google-assigned unique id of this user, provided by Google on login|
||first\_name|text|✔️|Google-provided first name of the user (note: may not be set in their Google profile, in which case this is null)|
||last\_name|text|✔️|Google-provided last name of the user (note: may not be set in their Google profile, in which case this is null)|
||created\_at|timestamp with time zone|✔️|Timestamp at which this user record was first created|
||last\_activity\_at|timestamp with time zone|✔️|Timestamp at which this user last went through the login flow on the app|
||photo\_url|text|✔️|Google-provided profile photo URL of the user (note: may not be set in their Google profile, in which case this is null)|
||display\_name|text|✔️|Google-provided profile display name of the user (note: may not be set in their Google profile, in which case this is null)|
||computed\_name|text|❌|Computed (virtual) field that provides a validated, non-null display name for the front-end to use|
||computed\_avatar|text|❌|Computed (virtual) field that provides a validated, non-null avatar URL for the front-end to use|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|`user_id = -1` (server-only)|
|Update|Own row only|
|Delete|-|

### course-users
This relation is used to store user roles within courses. It is a junction table (many-to-many relationship) between courses and users, and each entry is assigned a role indicating the user's permissions within the course. If a course-user pair does not occur in this table, it is assumed that the user is not a part of the course in any capacity.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|course\_id|integer|❌|References the course being described in this relation; forms a primary key with user\_id; foreign key from [courses](#courses)|
|🔑✈️|user\_id|integer|❌|References the user being described in this relation; forms a primary key with course\_id; foreign key from [users](#users)|
||role|text|❌|One of 'professor', 'ta', or 'student', describing the user's role within the course|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|All users, but only if `role='student'`|
|Update|Professors for the course|
|Delete|-|

### session-series
This relation is used to store metadata about weekly recurring office hour sessions. These recurring sessions are referred to as a 'series'. The series stored in this table do not represent actual sessions! Session instances are always stored in [sessions](#sessions) only.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|session\_series\_id|integer|❌|Auto-incrementing id assigned to each session series|
||start\_time|timestamp with time zone|❌|Represents the weekly start time and day of the series; the actual date is discarded and does not matter! (eg. '2018-06-22T11:00:00-04:00')|
||end\_time|timestamp with time zone|❌|Represents the weekly end time and day of the series; the actual date is discarded and does not matter! (eg. '2018-06-22T12:00:00-04:00')|
||building|text|❌|Name of the building in which this series occurs (eg. 'Gates')|
||room|text|❌|Name of the room in which this series occurs (eg. 'G17')|
|✈️|course\_id|integer|❌|References the course to which this session series belongs; foreign key from [courses](#courses)|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|TAs and professors for the course|
|Update|TAs and professors for the course|
|Delete|TAs and professors for the course|

### session-series-tas
This is a junction table (many-to-many relationship) between [session\_series](#session-series) and [users](#users) that describes the TAs that host a particular session series. Note that it is possible for sessions to be hosted by multiple TAs.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|session\_series\_id|integer|❌|References the session series whose host TA is being described; forms a primary key with user\_id; foreign key from [session\_series](#session-series)|
|🔑✈️|user\_id|integer|❌|References the user who is the host TA for the session series; forms a primary key with session\_series\_id; foreign key from [users](#users)|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|TAs and professors for the course|
|Update|TAs and professors for the course|
|Delete|TAs and professors for the course|

### sessions
This relation is used to store metadata about office hour session instances. Note that session instances may be part of a session series, or they may be independent sessions. This is dictated by whether or not the session\_series\_id field is null. Even if the session is part of a session series, all the metadata will be stored here in a replicated manner. If a session from a series is edited in a one-off, indepedent manner, then session\_series\_id will be set to null to prevent it from being affected by series edits.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|session\_id|integer|❌|Auto-incrementing id assigned to each session|
||start\_time|timestamp with time zone|❌|Timestamp at which this particular session is to start (eg. '2018-06-22T11:00:00-04:00')|
||end\_time|timestamp with time zone|❌|Timestamp at which this particular session is to end (eg. '2018-06-22T12:00:00-04:00')|
||building|text|❌|Name of the building in which this session occurs (eg. 'Gates')|
||room|text|❌|Name of the room in which this series occurs (eg. 'G17')|
|✈️|session\_series\_id|integer|✔️|References the session series to which this session belongs, if any; foreign key from [session\_series](#session-series)|
|✈️|course\_id|integer|❌|References the course to which this session series belongs; foreign key from [courses](#courses)|
|✈️|title|string|✔️|The name of the session, shown instead of TA names|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|TAs and professors for the course|
|Update|TAs and professors for the course|
|Delete|TAs and professors for the course|

### session-tas
This is a junction table (many-to-many relationship) between [sessions](#sessions) and [users](#users) that describes the TAs that host a particular session instance. Note that it is possible for session instances to be hosted by multiple TAs. In case a session belongs to a series, the information from [session\_series\_tas](#session-series-tas) is stored here in a replicated manner.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|session\_id|integer|❌|References the session whose host TA is being described; forms a primary key with user\_id; foreign key from [sessions](#sessions)|
|🔑✈️|user\_id|integer|❌|References the user who is the host TA for the session; forms a primary key with session\_id; foreign key from [users](#users)|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|TAs and professors for the course|
|Update|TAs and professors for the course|
|Delete|TAs and professors for the course|

### questions
This table contains all the details about all the questions asked across different sessions and courses. As the question's status is updated, its corresponding entry's 'status' field is changed.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|question\_id|integer|❌|Auto-incrementing id assigned to each question|
||content|text|❌|Text content of the question; character limit is imposed by the client|
||time\_entered|timestamp with time zone|❌|Timestamp at which this question was first entered into the database; it defaults to the current timestamp if not provided|
||status|text|❌|Text that represents the current status of the question ('unresolved', 'resolved', 'noshow', 'retracted' are currently used values)|
||time\_addressed|timestamp with time zone|✔️|Timestamp at which this question was most recently marked as resolved, no-show or retracted|
||session\_id|integer|❌|References the session instance in which this question was asked; foreign key from [sessions](#sessions)|
||asker\_id|integer|❌|References the student (user) who asked this question; foreign key from [users](#users)|
||answerer\_id|integer|✔️|References the TA (user) who most recently marked this question as resolved or as a no-show, and is NULL for unanswered and retracted questions; foreign key from [users](#users)|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|All users, as long as `asker_id` is the logged-in user; queue should be open, i.e. (start time - open interval) <= `NOW()` <= (end time)|
|Update|User who asked the question; TAs and professors for the course|
|Delete|-|

### tags
This relation is a repository of all the tags stored in the system, across different course offerings. Note that two tags in the same course with the same name should be separated if they are fundamentally different entities that need different analytics. For example, Q1 under Assignment 1 and Q1 under Assignment 2 should be separated as two tags, since they are to be analyzed independently.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|tag\_id|integer|❌|Auto-incrementing id assigned to each tag|
||name|text|❌|Name of the tag that is shown to the client|
|✈️|course\_id|integer|❌|The course offering to which this tag belongs; foreign key from [courses](#courses)|
||level|integer|❌|Encodes the tag level in the tag hierarchy: primary = 1, secondary = 2|
||activated|boolean|❌|For primary tags, this indicates whether they are currently inactive (hidden from students) or not. For secondary tags, this enocdes 'soft deletion'; if false, it means that a secondary tag was removed by a professor, but we keep it around since existing questions may refer to it.|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|Professors for the course|
|Update|Professors for the course|
|Delete|Professors for the course|

### tag-relations
Describes the tree-like tag hierarchy using parent-child relationships. Each entry in the table describes a parent tag and a child tag.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|parent\_id|integer|❌|tag\_id of the parent; forms a primary key with child\_id; foreign key from [tags](#tags)|
|🔑✈️|child\_id|integer|❌|tag\_id of the child; forms a primary key with parent\_id; foreign key from [tags](#tags)|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|Professors for the course|
|Update|Professors for the course|
|Delete|Professors for the course|

### question-tags
Junction table (many-to-many relationship) between [questions](#questions) and [tags](#tags) that attaches tags to questions.

|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|question\_id|integer|❌|question\_id of the question that is tagged with tag\_id; forms a primary key with tag\_id; foreign key from [questions](#questions)|
|🔑✈️|tag\_id|integer|❌|tag\_id of the tag that is to be attached to question\_id; forms a primary key with question\_id; foreign key from [tags](#tags)|

#### Authorization Rules
|Operation|Who is allowed?|
|:---:|---|
|Read|All users|
|Insert|Logged-in student; TAs and professors for the course|
|Update|User who asked the question; TAs and professors for the course|
|Delete|User who asked the question; TAs and professors for the course|

## Functions

In addition to the above tables, the following functions have been implemented in PL/pgSQL and are made available in GraphQL by Postgraphile. In most cases that involve multiple GraphQL queries from the client, or complex business logic, it is better to factor the complexity out into the API itself by exposing functions at the database level. The functions implemented in PL/pgSQL are made available to the client by Postgraphile. Note that some functions are designed to be called directly from the client (prefixed by 'api'), while the others should not be called directly (prefixed by either 'internal' or 'trigger').

### API Functions
Functions that are designed to be exposed to the client directly are prefixed with 'api'. Please read this documentation before using those functions!

#### Sessions / Series API
To deal with the intricate logic involving sessions, session series, and their creation/mutation/deletion, the following functions have been implemented. **To mutate either one-off indepedent sessions, or a series of sessions, this API must be used rather than direct mutations of the entities. Otherwise, the data will be inconsistent.** For all of these functions, please always provide _all_ of the parameters.

#### api\_create\_series

##### Description
Given all the details of a new weekly-recurring session series, this function will update the database to include the series metadata and will create session instances for the series. Session instances are only created if they end after the current time, and if their start time lies between the course's start and end dates (inclusive).

##### Parameters
- \_start\_time (timestamp with time zone): contains the weekly start day and time of this series; the actual date in this timestamp does not matter! (eg. '2018-06-22T11:00:00-04:00')
- \_end\_time (timestamp with time zone): contains the weekly end day and time of this series; the actual date in this timestamp does not matter! (eg. '2018-06-22T12:00:00-04:00')
- \_building (text): the name of the building in which the recurring session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the recurring session will take place (eg. 'G11')
- \_course\_id (integer): the id of the course to which this session series is to be added
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session series
- \_title (string): the name of the session. For 3110, it's conceptual or debugging

##### Returns
All the fields of the newly inserted row in the [session\_series](#session-series) table

#### api\_edit\_series

##### Description
Given updated details of an existing weekly-recurring session series, this function will update the database to include the new series metadata and will update the session instances for the series with the new details. Session instances are only edited if they have not yet ended. Sessions in the series that have already ended remain untouched.

##### Parameters
- \_series\_id (integer): the id of the session series to be edited
- \_start\_time (timestamp with time zone): contains the weekly start day and time of this series; the actual date in this timestamp does not matter! (eg. '2018-06-22T11:00:00-04:00')
- \_end\_time (timestamp with time zone): contains the weekly end day and time of this series; the actual date in this timestamp does not matter! (eg. '2018-06-22T12:00:00-04:00')
- \_building (text): the name of the building in which the recurring session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the recurring session will take place (eg. 'G11')
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session series
- \_title (string): the name of the session. For 3110, it's conceptual or debugging

##### Returns
All the fields of the updated row in the [session\_series](#session-series) table

#### api\_delete\_series

##### Description
This function deletes all the metadata and upcoming session instances of a given session series. Only session instances that have not yet started will be deleted. The other session instances will remain untouched, except their session\_series\_id will be set to NULL indicating that they are no longer owned by a session series. The records for the series in [session\_series](#session-series) and [session\_series\_tas](#session-series-tas) are removed.

##### Parameters
- \_series\_id (integer): the id of the session series to be deleted

##### Returns
Nothing (void)

#### api\_create\_session

##### Description
Given all the details of a new non-recurring (/independent/one-off) session, this function will create the session instance. The session will only be created if it has not ended yet. If the supplied end time has already passed, an exception will be thrown.

##### Parameters
- \_start\_time (timestamp with time zone): the exact time at which the session starts (date matters!) (eg. '2018-06-22T11:00:00-04:00')
- \_end\_time (timestamp with time zone): the exact time at which the session ends (date matters!) (eg. '2018-06-22T12:00:00-04:00')
- \_building (text): the name of the building in which the session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the session will take place (eg. 'G11')
- \_course\_id (integer): the id of the course to which this session is to be added
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session
- \_title (string): the name of the session. For 3110, it's conceptual or debugging

##### Returns
All the fields of the newly inserted row in the [sessions](#sessions) table

#### api\_edit\_session

##### Description
Given updated details of an existing session, this function will edit the session instance to match the supplied details. The session will only be edited if it has not ended yet. If the supplied end time has already passed, an exception will be thrown. **Note: this function will also set session\_series\_id to NULL!** If one session from a session series is edited using this function, it will subsequently become indepedent of the series.

##### Parameters
- \_session\_id (integer): the id of the session to be edited
- \_start\_time (timestamp with time zone): the exact time at which the session starts (date matters!) (eg. '2018-06-22T11:00:00-04:00')
- \_end\_time (timestamp with time zone): the exact time at which the session ends (date matters!) (eg. '2018-06-22T12:00:00-04:00')
- \_building (text): the name of the building in which the session will take place (eg. 'Gates')
- \_room (text): the name of the room in which the session will take place (eg. 'G11')
- \_tas (integer): a list of integers that represent the user\_ids of the TAs who will host this session
- \_title (string): the name of the session. For 3110, it's conceptual or debugging

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
- \_begin\_time (timestamp with time zone): the beginning of the time range to be queried for (inclusive bound) (eg. '2018-06-22T00:00:00-04:00')
- \_end\_time (timestamp with time zone): the end of the time range to be queried for (exclusive bound) (eg. '2018-06-23T00:00:00-04:00')

##### Returns
All the fields from the [sessions](#sessions) table of all the sessions in the course whose start\_time lies between the supplied begin\_time and end\_time. The returned sessions are sorted in increasing order of their start\_times.

#### api\_add\_question

##### Description
Given the details of a user-submitted question, this function inserts the data into the backend. This function is necessary because without it, the client would have to make multiple calls (one for each tag) to associate tags with the question. This function abstracts away that logic and provides a simpler API to the client. Note that the asker\_id is inferred by looking at the logged-in user who made the query. If no user is logged in, the query will fail with an exception. This function checks to make sure the user doesn't have any unresolved questions in any other currently active sessions. This function also checks that the user's question is under the character limit.

##### Parameters
- \_content (text): the user-submitted text content of the question
- \_status (text): the initial status of the question, see the [questions](#questions) table for more details
- \_session\_id (integer): the id of the session in which the question is to be added
- \_tags (integer[]): a list of tag\_ids that are to be associated with the question

##### Returns
All the fields of the newly-inserted row from the [questions](#questions) table

#### api\_find\_or\_create\_user

##### Description
Given the details of a user who has just logged in using Google, this function will find, update and return the user's existing details in the [users](#users) table. If it is a new user, a new row is inserted into [users](#users) for them. This is meant to be used during the login process, right after the user has successfully logged in via Google. Note that only a user that sends a JWT in the Authorization header containing the claim userId=-1 will be allowed to make this call successfully. The server is the only entity that has access to the secret, so only the server is allowed to make this call (after successful Google login); users will not be able to mock the identity of other users by calling this function directly.

Note that if the user already exists, their details are synced with the latest Google-provided information. Therefore, on login, our user's profile details are updated to match their profile on Google.

##### Parameters
- \_email (text): the full email address of the user who logged in
- \_google\_id (text): the Google-assigned unique identifier of the user who logged in
- \_first\_name (text): the given name of the user who logged in; if no given name is provided by Google, do not provide this parameter
- \_last\_name (text): the family name of the user who logged in; if no family name is provided by Google, do not provide this parameter
- \_photo\_url (text): the profile picture URL of the user who logged in; if no URL is provided by Google, do not provide this parameter
- \_display\_name (text): the display name of the user who logged in; if no display name is provided by Google, do not provide this parameter

##### Returns
All the fields of the newly-inserted or retrieved row from the [users](#users) table

#### api\_get\_current\_user

##### Description
This function is used to securely identify the logged-in user. It relies on the authentication flow; specifically, the logged-in user will pass the signed JWT to the backend in an Authorization header, and Postgraphile will decrypt it and make its claims available as local Postgres settings. In our case, the JWT has one relevant claim, which is the user\_id claim. This function simply retrieves the details of the logged-in user, and null if no one is logged in.

##### Parameters
None. It relies on Apollo sending the cookies to the backend, which in turn decrypts it into the JWT and attaches it as a header for Postgraphile to handle.

##### Returns
All the fields of the logged-in user from the [users](#users) table.

#### api\_create\_primary\_tag

##### Description
This function is used to create a primary (assignment) tag, along with its children secondary tags, and to associate the parent-child relationships in the database. This is useful because without it, the front-end would have to do multiple queries to the database to insert the tags, and then further queries to associate the tag relations. This function abstracts the sequence of steps away into one function call.

##### Parameters
- \_course_id (integer): the id of the course within which the tags are to be inserted
- \_iname (text): name of the primary (assignment) tag to be created; note that there is no reason as to why this is not called `_name`, and can be changed in the future
- \_activated (bool): active/inactive status of the primary tag being created
- \_child\_names (text[]): list of names of children secondary tags to be created under the primary tag
- \_child\_activateds (integer[]): list of active/inactive statuses of the children secondary tags; as of this point, this field is redundant since it is always true for newly-created tags, however it is included for verbosity. Note that this is an `integer[]` instead of `bool[]` because Postgraphile had some trouble with boolean arrays.

##### Returns
All the fields of the newly-created primary tag from the [tags](#tags) table.

#### api\_edit\_primary\_tag

##### Description
This function is used to edit a primary (assignment) tag, along with its children secondary tags, and to associate any new parent-child relationships in the database. This is useful because without it, the front-end would have to do multiple queries to the database to update the tags, insert new secondary tags, and to associate the tag relations. This function abstracts the sequence of steps away into one function call. Note that all fields must be provided even if they have not changed! The inputs in totality represent the latest state of the primary tag and its children. For example, leaving out a secondary tag that has not been updated will result in it being (soft) deleted. Instead, please always provide all unupdated fields!

##### Parameters
- \_parent_id (integer): the id of the parent primary tag being edited
- \_iname (text): updated name of the primary (assignment) tag; note that there is no reason as to why this is not called `_name`, and can be changed in the future
- \_activated (bool): updated active/inactive status of the primary tag
- \_child\_ids (text[]): list of updated ids of children secondary tags under the primary tag; wherever this value is -1, it is assumed that a new secondary tag is to be created
- \_child\_names (text[]): list of updated names of children secondary tags under the primary tag
- \_child\_activateds (integer[]): list of updated active/inactive statuses of the children secondary tags; note that this is an `integer[]` instead of `bool[]` because Postgraphile had some trouble with boolean arrays.

##### Returns
All the fields of the updated primary tag from the [tags](#tags) table.

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

### Trigger Functions

Trigger functions are prefixed by 'trigger' and **should never be called directly by the client**. These functions are called triggers because they are set up to be automatically called when an event is triggered in the database. For example, one can set up a trigger function that will execute whenever a new row is inserted into some table. These are useful for a few things:

- **Injecting variables that should only be trusted on the backend:** for example, we should never let the front-end specify the user's user id, since that _may_ be prone to tampering by the client. Instead, we should only trust the JWT that is decrypted and made available to us at the database level to figure out who the user is.

- **Consistency with timestamps:** trusting clients to pass in timestamps can sometimes lead to inconsistencies (for example, different timezones, or lags in queries). Whenever we're inserting the current timestamp, we should trust the backend to do it to maintain consistent results.

- **Authorization:** once a user has authenticated, they shouldn't be allowed full access to all parts of the database. Certain users are only allowed certain operations within the database. Triggers can help us safeguard tables within the database and prevent misuse.

|Trigger Function|Table|Condition|Description|
|---|---|---|---|
trigger\_before\_update\_question|[questions](#questions)|before update|injects answerer\_id and time\_addressed|
trigger\_after\_insert\_course|[courses](#courses)|after insert|adds every existing user as a student of the inserted course in [course-users](#course-users)|

## Types

### jwt\_token
This type is declared so that it can be passed to Postgraphile during initialization as the jwtPgTypeIdentifier.

- user\_id (integer): the id of the logged in user, which is bundled into the signed JWT token
