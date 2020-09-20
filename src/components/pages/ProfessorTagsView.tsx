import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ProfessorTagsTable from '../includes/ProfessorTagsTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorView from '../includes/ProfessorView';
import { useMyUser, useCourse } from '../../firehooks';

const ProfessorTagsView = (
    { match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>
) => {
    const user = useMyUser();
    const course = useCourse(courseId);
    return (
        <ProfessorView>
            <ProfessorSidebar
                courseId={courseId}
                code={course ? course.code : 'Loading...'}
                selected={1}
            />
            <TopBar courseId={courseId} user={user} context="professor" role="professor" />
            <section className="rightOfSidebar">
                <div className="main">
                    <ProfessorAddNew courseId={courseId} />
                    <div className="Calendar">
                        <ProfessorTagsTable courseId={courseId} />
                    </div>
                </div>
            </section>
        </ProfessorView>
    );
};

export default ProfessorTagsView;
