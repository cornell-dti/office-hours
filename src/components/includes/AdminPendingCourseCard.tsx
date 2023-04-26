import React from 'react';
import { Card } from '@material-ui/core';

import AdminReadOnlyCourseCard from './AdminReadOnlyCourseCard';

const AdminPendingCourseCard = ({ course }: { readonly course: FireCourse }) => {
    return (
        <Card className="course">
            <AdminReadOnlyCourseCard course={course} showSettings={false}/>
            <div>
                {/* on click remove from pending course */}
                <button type="button" className="pending-button reject"> 
                    Reject
                </button>
                {/* on click create course */}
                <button type="button" className="pending-button confirm">
                    Confirm
                </button>
            </div>
        </Card>
    );
};

export default AdminPendingCourseCard;