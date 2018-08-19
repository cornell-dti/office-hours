#!/bin/bash

echo '---------------'
echo 'This script will drop your local database, and recreate it using the latest schema and mock data in server/database/mock_database.sql. Do not run this if you made any changes to the schema that are not yet checked into the mock_database.sql file!'
echo ''
echo 'Make sure you have filled in your local database details in .env/db.sh before running this! Otherwise the script will not be able to locate your database.'
echo '---------------'
echo ''

source '../.env/db.sh'

echo 'Wiping the existing local database... (do not worry if you get "ERROR: role backend already exists")'
psql "${LOCAL_DATABASE_URL}" << EOF
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    CREATE ROLE backend;
EOF
echo ''

echo 'Populating it with the schema and mock data provided in server/database/mock_database.sql...'
psql "${LOCAL_DATABASE_URL}" < ../server/database/mock_database.sql
echo ''

echo 'Done! Your local database is now up-to-date with the latest version of the schema :)'