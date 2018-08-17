#!/bin/bash

echo '---------------'
echo 'This script will drop your local database, and recreate it using the latest schema and mock data in server/database/mock_database.sql. Do not run this if you made any changes to the schema that are not yet checked into the mock_database.sql file!'
echo '---------------'
echo ''

echo 'Local database hostname:'
read host
echo ''
echo 'Local database port:'
read port
echo ''
echo 'Local database name:'
read dbname
echo ''
echo 'Local database username:'
read username
echo ''

echo 'Dropping the existing local database...'
dropdb -h $host -p $port -U $username $dbname
echo ''

echo 'Creating a new local database...'
createdb -h $host -p $port -U $username $dbname
echo ''

echo 'Creating backend role on database (do not worry if you get "ERROR: role backend already exists")'
psql -h $host -p $port -U $username $dbname << EOF
    CREATE ROLE backend
EOF
echo ''

echo 'Populating it with the schema and mock data provided in server/database/mock_database.sql...'
psql -h $host -p $port -U $username $dbname < ../server/database/mock_database.sql
echo ''

echo 'Done! Your local database is now up-to-date with the latest version of the schema :)'