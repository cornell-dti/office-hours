import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorRolesTable from '../includes/ProfessorRolesTable';
import { useMyUser, useCourse } from '../../firehooks';

const ProfessorDashboardView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const user = useMyUser();
    const course = useCourse(courseId);

    return (
        <div className="ProfessorView">
            <ProfessorSidebar courseId={courseId} code={course ? course.code : 'Loading'} selected={4} />
            <TopBar courseId={courseId} user={user} context="professor" role="professor" />
            <section className="rightOfSidebar">
                <div className="main">
                    <ProfessorRolesTable courseId={courseId} />
                </div>
            </section>
        </div>
    );
};

export default ProfessorDashboardView;