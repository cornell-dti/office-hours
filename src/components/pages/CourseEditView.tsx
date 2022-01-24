import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import {connect} from 'react-redux'
import CourseSelection from '../includes/CourseSelection';
import { useAllCourses, usePendingUser } from '../../firehooks';
import { RootState } from '../../redux/store';

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})((user: {user: FireUser | undefined}) => {
    const allCourses = useAllCourses();
    const pendingUser = usePendingUser();
    if (user === undefined || allCourses.length === 0 || pendingUser?.email) {
        // Clearly not all data have been loaded.
        return <Loader active={true} content="Loading" />;
    }
    return <CourseSelection allCourses={allCourses} isEdit />;
});
