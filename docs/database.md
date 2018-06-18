# Database Documentation
This document provides detailed descriptions of the PostgreSQL database schema being used for the project, including column-level specifications and function specifications. **Whenever the schema is changed, this document should be updated in the _same_ PR!**

## Tables
|Table|Description|
|----|-----------|
|[courses](#courses)|Instances of specific course offerings that are using Queue Me In (eg. CS 3110, Fall 2018)|
|[users](#users)|Record of registered users on Queue Me In|
|[course_users](#course-users)|Junction table between [courses](#courses) and [users](#users) that describes user roles within each course|

### courses
|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑|course_id|integer|❌|Auto-incrementing id assigned to each course offering|
||code|text|❌|Shorthand name for the course, for example 'CS 3110'|
||name|text|❌|Expanded name for the course, for example 'Functional Programming'|
||semester|text|❌|Shorthand reference to the semester the course occurs in, for example 'SP18' or 'FA18'|
||start_date|date|❌|Date on which office hours for this course are to start|
||end_date|date|❌|Date on which office hours for this course are to end|

### users
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
|Key|Column|Datatype|Nullable?|Description|
|:---:|---|---|:---:|---|
|🔑✈️|course_id|integer|❌|References the course being described in this relation (forms a primary key with user\_id)|
|🔑✈️|user_id|integer|❌|References the user being described in this relation (forms a primary key with course\_id)|
||role|text|❌|One of 'professor', 'ta', or 'student', describing the user's role within the course|

## Functions