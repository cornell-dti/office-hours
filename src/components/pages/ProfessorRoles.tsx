import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorRolesTable from '../includes/ProfessorRolesTable';
import ProfessorView from '../includes/ProfessorView';
import { useMyUser, useCourse } from '../../firehooks';

const ProfessorDashboardView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const user = useMyUser();
    const course = useCourse(courseId);

    return (
        <ProfessorView>
            <ProfessorSidebar courseId={courseId} code={course ? course.code : 'Loading'} selected={4} />
            <TopBar courseId={courseId} user={user} context="professor" role="professor" />
            <section className="rightOfSidebar">
                <div className="main">
                    <ProfessorRolesTable courseId={courseId} />
                </div>
            </section>
        </ProfessorView>
    );
};

export default ProfessorDashboardView;
