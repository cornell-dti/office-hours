import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import CourseSelection from '../includes/CourseSelection';
import { useAllCourses, useAllPendingCourses } from '../../firehooks';
import { RootState } from '../../redux/store';

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})( (user: {user: FireUser | undefined}) => {
    const allCourses = useAllCourses();
    const allPendingCourses = useAllPendingCourses();

    if (user === undefined || allCourses.length === 0) {
        // Clearly not all data have been loaded.
        return <Loader active={true} content="Loading" />;
    }
    return <CourseSelection allCourses={allCourses} allPendingCourses={allPendingCourses} isEdit={false} />;
});
