import React, { useState, useEffect } from 'react';
import {useHistory} from 'react-router'
import {Grid} from '@material-ui/core'

import TopBar from '../includes/TopBar';
import AdminCourseCard from '../includes/AdminCourseCard';
import AdminCourseCreator from '../includes/AdminCourseCreator';
import AdminPendingCourseCard from '../includes/AdminPendingCourseCard';
import { useAllCourses, useIsAdmin } from '../../firehooks';
import { CURRENT_SEMESTER } from '../../constants';


const AdminView = () => {
    const history = useHistory();
    const courses = useAllCourses();
    const isAdmin = useIsAdmin();
    const [inCreationMode, setInCreationMode] = useState(false);
    useEffect(() => {
        if(isAdmin === undefined) {
            history.push('/')
        }
    }, [isAdmin, history])

    return (
        <div className="AdminView">
            <TopBar
                // In admin view, it is never the case that the Dashboard section should be shown.
                role="student"
                context="professor"
                // This field is only necessary for professors, but we are always student/TA here.
                courseId="DUMMY_COURSE_ID"
            />

            <h2>New Course Requests</h2>
            <div className="course-container" >
                <Grid container direction="row" alignItems={'stretch'} spacing={3}>
                    {/* change to pending courses */}
                    {courses.filter(course => course.semester === CURRENT_SEMESTER).map(course => (
                        <Grid item xl={3} lg={4} md={6} xs={12}>
                            <AdminPendingCourseCard key={course.courseId} course={course} />
                        </Grid>
                    ))}
                </Grid>
            </div>

            <h2>Courses</h2>
            <div className="course-container" >
                <Grid container direction="row" alignItems={'stretch'} spacing={3}>
                    {courses.filter(course => course.semester === CURRENT_SEMESTER).map(course => (
                        <Grid item xl={3} lg={4} md={6} xs={12}>
                            <AdminCourseCard key={course.courseId} course={course} />
                        </Grid>
                    ))}
                </Grid>
            </div>

            {inCreationMode && <AdminCourseCreator onSubmit={() => setInCreationMode(false)} />}

            {!inCreationMode &&
                <button 
                    type="button" 
                    className="create-course-btn" 
                    onClick={() => setInCreationMode(true)}
                >Create New Course</button>}

            <h2>Archived Courses</h2>
            <div className="course-container">
                <Grid container direction="row" alignItems={'stretch'} spacing={3}>
                    {courses.filter(course => course.semester !== CURRENT_SEMESTER).map(course => (
                        <Grid item xl={3} lg={4} md={6} xs={12}>
                            <AdminCourseCard key={course.courseId} course={course} />
                        </Grid>
                    ))}
                </Grid>
            </div>
        </div>
    );
};

export default AdminView;
