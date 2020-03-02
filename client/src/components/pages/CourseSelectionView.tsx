import * as React from 'react';
import CourseSelection from '../includes/CourseSelection';
import { Loader } from 'semantic-ui-react';
import { useMyUser, useAllCourses, useOptionalMyCourseUsers } from '../../firehooks';

export default () => {
    const user = useMyUser();
    const allCourses = useAllCourses();
    const myCourseUsers = useOptionalMyCourseUsers();
    if (user === undefined || allCourses.length === 0 || myCourseUsers === null) {
        // Clearly not all data have been loaded.
        return <Loader active={true} content="Loading" />;
    }
    return <CourseSelection user={user} allCourses={allCourses} myCourseUsers={myCourseUsers} isEdit={false} />;
};
