#!/bin/bash

echo '---------------'
echo 'This script will apply a certain migration to your local database, so that it can be tested before being applied to staging (and eventually production).'
echo ''
echo 'To closely mirror what will happen in staging and production, make sure you have the latest version of the schema available in mock_database.sql. This should be the same version that is on GitHub (you may need to git pull if there is a newer version available).'
echo 'You can reset your database to this latest schema (+ mock data) by running the dbResetLocal.sh script.'
echo '---------------'
echo ''
echo 'Enter "yes" to continue: '
read confirmation
if [ "$confirmation" != "yes" ]
then
    exit 1
fi

source '../.env/db.sh'

echo ''

echo 'Enter the name of your migration file (without the .sql) in the /server/database/migrations/ folder (eg. 0001_base_schema):'
read migration_file

echo ''

echo "Applying migration ${migration_file} to your local database..."
psql "${LOCAL_DATABASE_URL}" < "../server/database/migrations/${migration_file}.sql"
echo ''

echo 'Done! The migration has been applied to your local database :)'
echo ''
echo "In case something went terribly wrong, you can use the dbResetLocal.sh script to reset your local database (and then try again with the necessary tweaks)."