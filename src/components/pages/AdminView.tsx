import React, { useState, useEffect } from 'react';
import {useHistory} from 'react-router'
import {Grid} from '@material-ui/core'
import firebase from 'firebase/app';
import { firestore } from '../../firebase';

import TopBar from '../includes/TopBar';
import AdminCourseCard from '../includes/AdminCourseCard';
import AdminCourseCreator from '../includes/AdminCourseCreator';
import { useAllCourses, useIsAdmin } from '../../firehooks';
import { CURRENT_SEMESTER, START_DATE, END_DATE } from '../../constants';


const AdminView = () => {
    const history = useHistory();
    const courses = useAllCourses();
    const isAdmin = useIsAdmin();
    const [inCreationMode, setInCreationMode] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [TCNum, setTCNum] = useState("1");
    useEffect(() => {
        if(isAdmin === undefined) {
            history.push('/')
        }
    }, [isAdmin, history])

    const generateTestCourse = (num : string) => {
        // create a course
        const year = (new Date(START_DATE)).getFullYear() % 100;
        const term = CURRENT_SEMESTER.substr(0, 2);
        const course: Omit<FireCourse, 'courseId'> = {
            name: `Test Course ${num}`,
            code: `TC 00${num}`,
            semester: `${term}${year}`,
            year: `${year}`,
            term,
            queueOpenInterval: 30,
            charLimit: 200,
            startDate: firebase.firestore.Timestamp.fromDate(new Date(START_DATE)),
            endDate: firebase.firestore.Timestamp.fromDate(new Date(END_DATE)),
            professors: [],
            tas: []
        };
        firestore.collection('courses').doc(`TC00${num}-${term}-${year}`).set(course);
        setShowConfirmPopup(false);
        setTCNum("1");
    }

    return (
        <div className="AdminView">
            <TopBar
                // In admin view, it is never the case that the Dashboard section should be shown.
                role="student"
                context="professor"
                // This field is only necessary for professors, but we are always student/TA here.
                courseId="DUMMY_COURSE_ID"
            />

            {showConfirmPopup && (
                <div className="popup">
                    <div className="popupContainer">
                        <div className="resolvedQuestionBadge">
                            <p className="resolvedQuestionText">
                                Are you sure you want to create a test course?
                            </p>
                        </div>
                        <div> 
                            I want to create Test Course <input 
                                className="TCNum" 
                                type="number" 
                                value={TCNum} 
                                onChange={(e) => setTCNum(e.target.value)} 
                            />
                        </div>
                        <div className="buttons">
                        <p className="Cancel" onClick={() => setShowConfirmPopup(false)}>
                            Cancel
                        </p>
                        <p className="Confirm" onClick={() => generateTestCourse(TCNum)}>
                            Confirm
                        </p>
                    </div>
                    </div>
                </div>
            )}
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

            <button 
                type="button" 
                className="create-course-btn"
                onClick={() => setShowConfirmPopup(true)}>Generate Test Course</button>

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
