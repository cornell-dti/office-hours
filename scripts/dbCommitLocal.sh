#!/bin/bash

echo '---------------'
echo 'This script will commit the state of your local database (including the latest schema and mock data) to server/database/mock_database.sql. See the docs/scripts.md file for more details!'
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

echo 'Generating a dump of your local database and overwriting server/database/mock_database.sql...'
pg_dump -h $host -p $port -U $username --no-owner $dbname > ../server/database/mock_database.sql
echo ''

echo 'Done! /server/database/mock_database.sql is now up-to-date with your local database :)'