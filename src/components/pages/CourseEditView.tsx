import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import CourseSelection from '../includes/CourseSelection';
import { useMyUser, useAllCourses, usePendingUser } from '../../firehooks';

export default () => {
    const user = useMyUser();
    const allCourses = useAllCourses();
    const pendingUser = usePendingUser();
    console.log(pendingUser)
    if (user === undefined || allCourses.length === 0 || pendingUser?.email) {
        // Clearly not all data have been loaded.
        return <Loader active={true} content="Loading" />;
    }
    return <CourseSelection user={user} allCourses={allCourses} isEdit />;
};
