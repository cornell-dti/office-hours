import React, { useState, useEffect } from 'react';
import {useHistory} from 'react-router'
import {Grid} from '@material-ui/core'
import firebase from 'firebase/app';
import moment from 'moment';
import { firestore, Timestamp } from '../../firebase';

import TopBar from '../includes/TopBar';
import AdminCourseCard from '../includes/AdminCourseCard';
import AdminCourseCreator from '../includes/AdminCourseCreator';
import { useAllCourses, useIsAdmin } from '../../firehooks';
import { importProfessorsOrTAsFromCSV} from '../../firebasefunctions/importProfessorsOrTAs';
import { CURRENT_SEMESTER, START_DATE, END_DATE } from '../../constants';
import { createSeries } from '../../firebasefunctions/series';
import { createAssignment } from '../../firebasefunctions/tags';

enum Modality {
    VIRTUAL = 'virtual',
    HYBRID = 'hybrid',
    INPERSON = 'in-person',
    REVIEW = 'review',
}


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

    const generateTestCourse = (num: string) => {
        // create a course
        const year = (new Date(START_DATE)).getFullYear() % 100;
        const term = CURRENT_SEMESTER.substr(0, 2);
        const course: FireCourse = {
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
            tas: [],
            courseId: `TC00${num}-${term}-${year}`
        };
        firestore.collection('courses').doc(`TC00${num}-${term}-${year}`).set(course);
        setShowConfirmPopup(false);
        setTCNum("1");
        interface FireTag {
            active: boolean;
            courseId: string;
            level: number;
            tagId: string;
            name: string;
            parentTag?: string;
        }

        // create tags
        const hw: Omit<FireTag, 'tagId' | 'level'> = {
            active: true,
            courseId: `TC00${num}-${term}-${year}`,
            name: 'HW'
        }
        const hw1: NewTag = {
            name: 'HW1',
            id: "a9asaf67dfs"
        };
        const hw2: NewTag = {
            name: 'HW2',
            id: "2354jhi3g54y"
        };
        createAssignment(hw, [hw1, hw2])
        const lab: Omit<FireTag, 'tagId' | 'level'> = {
            active: true,
            courseId: `TC00${num}-${term}-${year}`,
            name: 'HW'
        }
        const lab1: NewTag = {
            name: 'Lab 3',
            id: "2634uyoy151f"
        };
        const lab2: NewTag = {
            name: 'Lab 2',
            id: "675j354ih7utfg"
        };
        createAssignment(lab, [lab1, lab2])

        // add a TA to the course
        importProfessorsOrTAsFromCSV(course, 'ta', ['abn53@cornell.edu']);

        // add a professor to the course
        importProfessorsOrTAsFromCSV(course, 'professor', ['abn53@cornell.edu']);

        // construct a session every day
        const virtualSeries: FireSessionSeriesDefinition = {
            useTALink: false,
            modality: Modality.VIRTUAL,
            courseId: `TC00${num}-${term}-${year}`,
            endTime: Timestamp.fromDate(moment().hours(24).minutes(59).seconds(59).toDate()),
            startTime: Timestamp.fromDate(moment().hours(0).minutes(0).seconds(0).toDate()),
            tas: [],
            title: "Virtual Session",
        };
        const personSeries: FireSessionSeriesDefinition = {
            modality: Modality.INPERSON,
            courseId: `TC00${num}-${term}-${year}`,
            endTime: Timestamp.fromDate(moment().hours(24).minutes(59).seconds(59).toDate()),
            startTime: Timestamp.fromDate(moment().hours(0).minutes(0).seconds(0).toDate()),
            tas: [],
            title: "In Person Session",
            building: 'Rhodes',
            room: '412',
        };
        const reviewSeries: FireSessionSeriesDefinition = {
            link: 'https://cornell.zoom.us/g/',
            modality: Modality.REVIEW,
            courseId: `TC00${num}-${term}-${year}`,
            endTime: Timestamp.fromDate(moment().hours(24).minutes(59).seconds(59).toDate()),
            startTime: Timestamp.fromDate(moment().hours(0).minutes(0).seconds(0).toDate()),
            tas: [],
            title: "Review Session",
        };

        // add one series for each day
        for(let i = 0; i < 7; i++) {
            createSeries(firestore, virtualSeries);
            createSeries(firestore, personSeries);
            createSeries(firestore, reviewSeries);
            virtualSeries.startTime = Timestamp.fromDate(moment(virtualSeries.startTime.toDate()).add(1, 'd').toDate());
            personSeries.startTime = virtualSeries.startTime;
            reviewSeries.startTime = virtualSeries.startTime;
            virtualSeries.endTime = Timestamp.fromDate(moment(virtualSeries.endTime.toDate()).add(1, 'd').toDate());
            personSeries.endTime = virtualSeries.endTime;
            reviewSeries.endTime = virtualSeries.endTime;
        }
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
                onClick={() => setShowConfirmPopup(true)}
            >Generate Test Course</button>

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
