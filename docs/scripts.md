# Scripts

We use the `/scripts` folder to store any useful scripts that simplify the development process. This document contains a descriptions of the different scripts available in the folder.

## dbResetLocal.sh

### What's it used for?
There are certain situations where you may want to reset your local database to the latest available schema and mock data for development purposes. For example, if you `git pull` changes, and the schema has been changed, then you would want to run this script so that your database has the latest schema. You might also want to reset the database in case you accidentally made some breaking changes to it.

### When should I not use it?
If you're testing schema changes to the database and haven't yet committed them, do not run this script! The script will essentially discard all your local database changes, which means you will lose your schema changes.

### What does it do?
- Asks the user to specify where their local Postgres database lives
- Drops the local Postgres database (make sure you don't have any uncommitted schema changes!)
- Creates a new local Postgres database at the same path
- Populates it with the schema and mock data that lives in [`/server/database/mock_database.sql`](../server/database/mock_database.sql)

## dbCommitLocal.sh

### What's it used for?
We maintain our latest schema with some mock data for local development purposes in [`/server/database/mock_database.sql`](../server/database/mock_database.sql). If you make changes to your database, and you'd like to 'commit' them so that others on the team can also get the update, then you need to overwrite `mock_database.sql`. In short, this script acts like a `git commit`; it dumps the state of your current local database into `mock_database.sql`, so that when you push this change, everyone else can update their databases to look just like yours.

### When should I not use it?
You shouldn't need to use this unless you are making schema changes to the database, in which case you should make sure that you're also checking in your migration into the `server/database/migrations` folder. Before running this script, make sure that there is nothing sensitive in your local database, since it will be pushed to our open-source repository for everyone to see.

### What does it do?
- Asks the user to specify where their local Postgres database lives
- Generates a dump of the local database, including schema and data in one file
- Overwrites `/server/database/mock_database.sql` with this generated dump


## dbProdToStaging.sh

### Prerequisites
- You will need to have the `.env/db.sh` file in your local repository, which you can download from our Google Drive (ask your PM for this!). Download the `.env` folder that was shared with you on Google Drive, and place it in your local repository folder.

### What's it used for?
Our staging environment is where we can test any changes against real data before actually shipping them in production. To catch bugs that might appear in production, it is beneficial to mirror the production environment closely in the staging environment. This involves keeping the staging database in sync with the production database as often as possible. This script manually generates a SQL dump of the production database, and then resets the staging database to match this snapshot.

### When should I not use it?
This may cause some brief downtime in production, so you should only use it during off-peak hours (ask your PMs)! Also, if someone on the team is testing changes in staging, their database will be flushed with the latest production data. You should make sure that no one on the team is in the middle of testing something in staging before running this!

### What does it do?
- Connects to the production database using the URLs specified in `.env/db.sh`
- Creates a `pg_dump` of the latest production data and schema
- Drops the staging database
- Creates a new staging database at the same path
- Populates it with the schema and data that was just downloaded from production
- Note that the generated dump from production is saved in `scripts/.temp`, which you should NOT commit to GitHub! If you need to save it, save it securely in Google Drive.