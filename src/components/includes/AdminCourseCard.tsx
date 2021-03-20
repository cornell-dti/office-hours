import React, {useState} from "react";
import {Card} from "@material-ui/core";

import AdminReadOnlyCourseCard from "./AdminReadOnlyCourseCard";
import AdminEditableCourseCard from "./AdminEditableCourseCard";
import ProfessorRolesTable from './ProfessorRolesTable';


const AdminCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [showRolesTable, setShowRolesTable] = useState(false);
    return (
        <Card className="course">
            {!isEditingMode && <AdminReadOnlyCourseCard course={course} />}
            {isEditingMode && <AdminEditableCourseCard course={course} />}
            <div>
                <button type="button" className="editing-button" onClick={() => setIsEditingMode(prev => !prev)}>
                    To {isEditingMode ? 'Read Only' : 'Editing'} Mode
                </button>
                <button type="button" className="roles-button" onClick={() => setShowRolesTable(prev => !prev)}>
                    {showRolesTable ? 'Hide' : 'Show'} Roles Table
                </button>
            </div>
            {showRolesTable && <ProfessorRolesTable courseId={course.courseId} isAdminView={true}/>}
        </Card>
    );
};

export default AdminCourseCard;