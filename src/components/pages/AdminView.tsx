import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import { Grid } from '@material-ui/core'
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';

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


    const stupidVal = "1"
    //courses.at(0)?.semester

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
                    value={stupidVal}
                    defaultValue={CURRENT_SEMESTER}
                    onChange={() => "ayo?"}
                    fullWidth
                    className="formControl"
                    sx={{
                        width: "100%",
                    }}
                >
                    <MenuItem value={CURRENT_SEMESTER}>*default*</MenuItem>
                    <MenuItem value="FA20">FA20</MenuItem>
                    <MenuItem value="SP20">SP20</MenuItem>
                    <MenuItem value="FA21">FA21</MenuItem>
                    <MenuItem value="SP21">SP21</MenuItem>
                    <MenuItem value="FA22">FA22</MenuItem>
                    <MenuItem value="SP22">SP22</MenuItem>
                    <MenuItem value="FA23">FA23</MenuItem>
                    <MenuItem value="SP23">SP23</MenuItem>
                    <MenuItem value="FA24">FA24</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>

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
            {!inCreationMode &&
                <button
                    type="button"
                    className="create-course-btn"
                    onClick={() => setInCreationMode(true)}
                >Create New Course</button>}
        </div>
    );
};

export default AdminView;
