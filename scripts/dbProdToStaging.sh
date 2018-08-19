#!/bin/bash

echo '---------------'
echo 'This script will copy over our production database to our staging database so that you can test your code against data similar to production.'
echo ''
echo ''
echo '*PLEASE DO THIS ONLY AT OFF-PEAK, LOW-TRAFFIC HOURS (ASK YOUR PMS) SINCE IT MIGHT TEMPORARILY AFFECT PRODUCTION QUERY SPEEDS*'
echo ''
echo 'The existing staging database will be dropped; please ping everyone on the team to make sure that they are okay with this!'
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

mkdir -p '.temp'

echo 'Creating a dump of the production database...(this may take a couple of minutes)'
pg_dump --no-owner "${PROD_DATABASE_URL}" > ".temp/${timestamp}_prod_dump.sql"

echo 'Wiping the existing staging database... (do not worry if you get "ERROR: role backend already exists")'
psql "${STAGING_DATABASE_URL}" << EOF
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    CREATE ROLE backend;
EOF
echo ''

echo 'Populating it with the production database dump...'
psql "${STAGING_DATABASE_URL}" < ".temp/${timestamp}_prod_dump.sql"
echo ''

echo 'Done! The staging database now reflects a recent snapshot of the production database :)'