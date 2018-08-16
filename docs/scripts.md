# Scripts

We use the `/scripts` folder to store any useful scripts that simplify the development process. This document contains a descriptions of the different scripts available in the folder.

## dbSyncMock.sh

### What's it used for?
There are certain situations where you may want to reset your local database to the latest available schema and mock data for development purposes. For example, if you `git pull` changes, and the schema has been changed, then you would want to run this script so that your database has the latest schema. You might also want to reset the database in case you accidentally made some breaking changes to it.

### When should I not use it?
If you're testing schema changes to the database and haven't yet committed them, do not run this script! The script will essentially discard all your local database changes, which means you will lose your schema changes.

### What does it do?
- Asks the user to specify where their local Postgres database lives
- Drops the local Postgres database (make sure you don't have any uncommitted schema changes!)
- Creates a new local Postgres database at the same path
- Populates it with the schema and mock data that lives in `/server/office_hours.sql`