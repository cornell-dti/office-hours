#!/bin/bash

echo '---------------'
echo 'This script will change the role of particular user in a particular course in your local database for testing purposes. Make sure you have the right course id handy!'
echo ''
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

echo 'Enter the email address of the user whose role is to be changed:'
read email

echo ''

echo 'Enter the course id in which this change is to be made:'
read courseid

echo ''

echo 'Enter 1 to make this user a professor, 2 to make them a TA, or 3 to make them a student:'
read role_number

role=''

if [ "$role_number" = "1" ]
then
	role='professor'
fi

if [ "$role_number" = "2" ]
then
	role='ta'
fi

if [ "$role_number" = "3" ]
then
	role='student'
fi

if [ "$role" = '' ]
then
	echo 'Received an invalid choice'
	exit 1
fi

echo "Are you sure you want to make ${email} a ${role} in course ${courseid} on your local database? Enter \"yes\" to continue: "
read confirmation
if [ "$confirmation" != "yes" ]
then
    exit 1
fi

echo ''

echo "Changing the user's role in your local database..."
psql "${LOCAL_DATABASE_URL}" << EOF
    UPDATE public.course_users SET role='$role' WHERE course_id=$courseid AND user_id=(SELECT user_id FROM public.users WHERE email='$email'); 
EOF
echo ''

echo 'Done! Refresh the course page on your local environment to see the changes :)'