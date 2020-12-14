import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useState } from 'react';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorRolesTable from '../includes/ProfessorRolesTable';
import { useMyUser, useCourse } from '../../firehooks';
import CSVUploadView from '../includes/CSVUploadView';

const ProfessorDashboardView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const user = useMyUser();
    const course = useCourse(courseId);
    const [viewOnlyMode, setViewOnlyMode] = useState(true);

    const cancel = () => {
        setViewOnlyMode(true);
    }

    const hide = () => {
        setViewOnlyMode(false);
    }

    return (
        
        <div className="ProfessorView">
            <ProfessorSidebar courseId={courseId} code={course ? course.code : 'Loading'} selected={4} />
            <TopBar courseId={courseId} user={user} context="professor" role="professor" />
            <section className="rightOfSidebar">
                {viewOnlyMode ?
                    <div className="main">
                        <div className="rightHeading">
                            <p className="manageRoles">Manage Roles</p>
                            <button type="button" id="importProf" onClick={hide}>
                                Import Professors/TAs
                            </button>
                        </div>
                        <ProfessorRolesTable courseId={courseId} isAdminView={false}/>
                    </div>
                    : <div className="main">
                        <div className="importProfs">Import Professors/TAs</div>
                        <CSVUploadView onReturn={cancel}/>
                    </div>
                }
                
            </section>
        </div>
    );
};
export default ProfessorDashboardView;
