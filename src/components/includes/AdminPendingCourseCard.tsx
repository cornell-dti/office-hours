import React from 'react';
import { Card } from '@material-ui/core';
import { rejectPendingCourse, confirmPendingCourse } from '../../firebasefunctions/courses';

import AdminReadOnlyCourseCard from './AdminReadOnlyCourseCard';

const AdminPendingCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const reject = () => {
        rejectPendingCourse(course.courseId)
    };

    const confirm = () => {
        confirmPendingCourse(course)
    };

    return (
        <Card className="course">
            <AdminReadOnlyCourseCard course={course} showSettings={false}/>
            <div>
                <button type="button" className="pending-button reject" onClick={reject}> 
                    Reject
                </button>
                <button type="button" className="pending-button confirm" onClick={confirm}> 
                    Confirm
                </button>
            </div>
        </Card>
    );
};

export default AdminPendingCourseCard;