# Database Documentation
This document provides detailed descriptions of the PostgreSQL database schema being used for the project, including column-level specifications and function specifications. **Whenever the schema is changed, this document should be updated in the _same_ PR!**

## Tables
|Table|Description|
|----|-----------|
|[courses](#courses)|Instances of specific course offerings that are using Queue Me In (eg. CS 3110, Fall 2018)|

### Courses
|Key|Column|Datatype|Nullable?|Description|
|---|---|---|---|---|
|🔑|course_id|integer|❌|Auto-incrementing id assigned to each course offering|
||code|text|❌|Shorthand name for the course, for example 'CS 3110'|
||name|text|❌|Expanded name for the course, for example 'Functional Programming'|
||semester|text|❌|Shorthand reference to the semester the course occurs in, for example 'SP18' or 'FA18'|
||start_date|date|❌|Date on which office hours for this course are to start|
||end_date|date|❌|Date on which office hours for this course are to end|

## Functions