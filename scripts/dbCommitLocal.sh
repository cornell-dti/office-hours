#!/bin/bash

echo '---------------'
echo 'This script will commit the state of your local database (including the latest schema and mock data) to server/database/mock_database.sql. See the docs/scripts.md file for more details!'
echo ''
echo 'Make sure you have filled in your local database details in .env/db.sh before running this! Otherwise the script will not be able to locate your database.'
echo '---------------'
echo ''
echo 'Enter "yes" to continue: '
read confirmation
if [ "$confirmation" != "yes" ]
then
    exit 1
fi
echo ''

source '../.env/db.sh'

echo 'Generating a dump of your local database and overwriting server/database/mock_database.sql...'
pg_dump --no-owner "${LOCAL_DATABASE_URL}" > ../server/database/mock_database.sql
echo ''

echo 'Done! /server/database/mock_database.sql is now up-to-date with your local database :)'