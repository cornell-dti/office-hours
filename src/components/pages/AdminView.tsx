import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import { Grid } from '@material-ui/core'
import { FormControl, Select, SelectChangeEvent, MenuItem, InputLabel } from '@mui/material';

import TopBar from '../includes/TopBar';
import AdminCourseCard from '../includes/AdminCourseCard';
import AdminCourseCreator from '../includes/AdminCourseCreator';
import { useAllCourses, useIsAdmin } from '../../firehooks';
import { CURRENT_SEMESTER } from '../../constants';


const AdminView = () => {
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
    const validSems = ["FA20", "SP20", "FA21", "SP21", "FA22", "SP22",
        "FA23", "SP23", "FA24", "SP24"]

    //courses.at(0)?.semester
    const handleChange = (event: SelectChangeEvent) => {
        setSem(event.target.value);
    };


    //make menu scrollable if list of sems gets super long
    return (
        <div className="AdminView">
            <TopBar
                // In admin view, it is never the case that the Dashboard section should be shown.
                role="student"
                context="professor"
                // This field is only necessary for professors, but we are always student/TA here.
                courseId="DUMMY_COURSE_ID"
            />
            <h2>Courses</h2>
            <FormControl>
                <InputLabel id="course-select-label">Semester</InputLabel>
                <Select
                    labelId="course-select-label"
                    id="course-select"
                    value={sem}
                    onChange={handleChange}
                    fullWidth
                    className="formControl"
                    sx={{
                        width: "100%",
                    }}
                >
                    {validSems.map(semester => {
                        return (
                            <MenuItem value={semester}>{semester}</MenuItem>

                        );
                    })}
                    <MenuItem value="">Other</MenuItem>
                </Select>
            </FormControl>


            <div className="course-container" >
                <Grid container direction="row" alignItems={'stretch'} spacing={3}>
                    {courses.filter(course => course.semester === sem).map(course => (
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
