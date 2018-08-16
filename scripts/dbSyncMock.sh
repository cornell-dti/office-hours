#!/bin/bash

echo '---------------'
echo 'This script will drop your local database, and recreate it using the latest schema and mock data in server/office_hours.sql. Do not run this if you made any changes to the schema that are not yet checked into the office_hours.sql file!'
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

echo 'Populating it with the schema and mock data provided in server/office_hours.sql...'
psql -h $host -p $port -U $username $dbname < ../server/office_hours.sql
echo ''

echo 'Done! Your local database is now up-to-date with the latest version of the schema :)'