#!/bin/bash

echo '---------------'
echo 'This script will apply a certain migration to our staging database, so that it can be tested before being applied to production.'
echo ''
echo ''
echo 'Please ping others on the team and let them know that you are applying migrations to staging.'
echo '---------------'
echo ''
echo 'Enter "yes" to continue: '
read confirmation
if [ "$confirmation" != "yes" ]
then
    exit 1
fi

timestamp=$(date +%s)

source '../.env/db.sh'

echo ''

echo 'Enter the name of your migration file (without the .sql) in the /server/database/migrations/ folder (eg. 0001_base_schema):'
read migration_file

echo ''

echo 'Creating a backup dump of the staging database in case the migration does not go well...(this may take a couple of minutes)'
pg_dump --no-owner "${STAGING_DATABASE_URL}" > ".temp/${timestamp}_staging_dump.sql"

echo ''

echo "Are you sure you want to apply the migration at /server/database/migrations/${migration_file}.sql? Enter \"yes\" to continue: "
read confirmation
if [ "$confirmation" != "yes" ]
then
    exit 1
fi

echo "Applying migration ${migration_file} to the staging database..."
psql "${STAGING_DATABASE_URL}" < "../server/database/migrations/${migration_file}.sql"
echo ''

echo 'Done! The migration has been applied to the staging database :)'
echo ''
echo "In case something went terribly wrong, this script generated a backup dump of the staging database at /scripts/.temp/${timestamp}_staging_dump.sql."