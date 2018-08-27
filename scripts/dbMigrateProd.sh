#!/bin/bash

echo '---------------'
echo 'This script will apply a certain migration to our production database, after it has been tested and verified on staging.'
echo ''
echo ''
echo '*PLEASE DO THIS ONLY AT OFF-PEAK, LOW-TRAFFIC HOURS (ASK YOUR PMS) SINCE IT MIGHT TEMPORARILY AFFECT PRODUCTION QUERY SPEEDS*'
echo '---------------'
echo ''
echo 'Have you tested this migration on our staging database? Enter "yes" to continue: '
read confirmation
if [ "$confirmation" != "yes" ]
then
    exit 1
fi

timestamp=$(date +%s)

source '../.env/db.sh'

mkdir -p '.temp'

echo ''

echo 'Enter the name of your migration file (without the .sql) in the /server/database/migrations/ folder (eg. 0001_base_schema):'
read migration_file

echo ''

echo 'Creating a backup dump of the production database in case the migration does not go well...(this may take a couple of minutes)'
pg_dump --no-owner "${PROD_DATABASE_URL}" > ".temp/${timestamp}_prod_dump.sql"

echo ''

echo "Are you sure you want to apply the migration at /server/database/migrations/${migration_file}.sql? Enter \"yes\" to continue: "
read confirmation
if [ "$confirmation" != "yes" ]
then
    exit 1
fi

echo "Applying migration ${migration_file} to the production database..."
psql "${PROD_DATABASE_URL}" < "../server/database/migrations/${migration_file}.sql"
echo ''

echo 'Done! The migration has been applied to the production database :)'
echo ''
echo "In case something went terribly wrong, this script generated a backup dump of the production database at /scripts/.temp/${timestamp}_prod_dump.sql."