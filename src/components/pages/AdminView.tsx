import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import { Grid } from '@material-ui/core'
import { FormControl, Select, SelectChangeEvent, MenuItem, InputLabel } from '@mui/material';

import { Icon } from 'semantic-ui-react'
import TopBar from '../includes/TopBar';
import AdminCourseCard from '../includes/AdminCourseCard';
import AdminCourseCreator from '../includes/AdminCourseCreator';
import { useAllCourses, useIsAdmin } from '../../firehooks';
import { CURRENT_SEMESTER, ALL_SEMESTERS } from '../../constants';
import  AnalyticsView from './AnalyticsView';


const AdminView = () => {
    const [collapsed, setCollapsed] = useState(true);
    const history = useHistory();
    const courses = useAllCourses();
    const isAdmin = useIsAdmin();
    const [inCreationMode, setInCreationMode] = useState(false);
    useEffect(() => {
        if (isAdmin === undefined) {
            history.push('/')
        }
    }, [isAdmin, history])

    const [sem, setSem] = useState(CURRENT_SEMESTER);
    const validSems = ALL_SEMESTERS;


    const handleChange = (event: SelectChangeEvent) => {
        setSem(event.target.value);
    };

    return (
        <div className="AdminView">
            <TopBar
                // In admin view, it is never the case that the Dashboard section should be shown.
                role="student"
                context="professor"
                // This field is only necessary for professors, but we are always student/TA here.
                courseId="DUMMY_COURSE_ID"
            />

            <h2><br />Queue Me In Product Analytics</h2>   
                  
            {collapsed ? (
                <Icon
                    // Chevron used to denote the location of the analytics table when it is expanded.
                    name='chevron down'
                    onClick={() => { setCollapsed(false)}}
                />
            ) : (
                <div>
                    <Icon
                        // Chevron used to denote the location of the analytics table when it is collapsed.
                        name='chevron up'
                        onClick={() => setCollapsed(true)}
                    />
                    
                </div>
            )}
            {/* Separate style logic so component is technically "rendered" only once when the admin page loads, not each time the arrow is clicked. This reduces repeated Firebase reads. */}
            <div style={collapsed ? {"display":"None"}: {}}>
            <AnalyticsView/>
            </div>
            


            <h2>Courses</h2>
            <FormControl sx={{ m: 1, minWidth: "8%", backgroundColor: "#FFFFFF" }}>
                <InputLabel id="course-select-input">Semester</InputLabel>
                <Select
                    labelId="course-select-label"
                    id="course-select"
                    value={sem}
                    label="Semester"
                    onChange={handleChange}
                    autoWidth
                    className="formControl"
                    sx={{
                        width: "100%",
                    }}
                >
                    <MenuItem value={CURRENT_SEMESTER}>Current Semester: {CURRENT_SEMESTER}</MenuItem>
                    {validSems.map(semester => {
                        return semester !== CURRENT_SEMESTER &&
                            (<MenuItem value={semester}>{semester}</MenuItem>);
                    })}
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>


            <div className="course-container" >
                <Grid container direction="row" alignItems={'stretch'} spacing={3}>
                    {/* Handles courses that are not in valid semesters to be shown in the "Other" menu option. */}
                    {courses
                        .filter(course => validSems.includes(sem, 0)
                            ? course.semester === sem
                            : !validSems.includes(course.semester, 0)
                        )
                        .map(course => (
                            <Grid item xl={3} lg={4} md={6} xs={12} key={course.courseId}>
                                <AdminCourseCard course={course} />
                            </Grid>
                        ))
                    }
                </Grid>
            </div>

            {inCreationMode && <AdminCourseCreator onSubmit={() => setInCreationMode(false)} />}

            {!inCreationMode &&
                <button
                    type="button"
                    className="create-course-btn"
                    onClick={() => setInCreationMode(true)}
                >Create New Course</button>}

            {sem === CURRENT_SEMESTER ?
                <div>
                    <h2>Archived Courses</h2>
                    <div className="course-container">
                        <Grid container direction="row" alignItems={'stretch'} spacing={3}>
                            {courses.filter(course => course.semester !== sem).map(course => (
                                <Grid item xl={3} lg={4} md={6} xs={12}>
                                    <AdminCourseCard key={course.courseId} course={course} />
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                    {!inCreationMode &&
                        <button
                            type="button"
                            className="create-course-btn"
                            onClick={() => setInCreationMode(true)}
                        >Create New Course</button>}
                </div> : null}

        </div>


    );
};

export default AdminView;
