import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import CourseSelection from '../includes/CourseSelection';
import { useMyUser, useAllCourses } from '../../firehooks';

export default () => {
    const user = useMyUser();
    const allCourses = useAllCourses();
    if (user === undefined || allCourses.length === 0) {
        // Clearly not all data have been loaded.
        return <Loader active={true} content="Loading" />;
    }
    return <CourseSelection user={user} allCourses={allCourses} isEdit />;
};
