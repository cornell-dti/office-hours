import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useState } from 'react';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorRolesTable from '../includes/ProfessorRolesTable';
import { useMyUser, useCourse } from '../../firehooks';
import CSVUploadView from '../includes/CSVUploadView';
import CloseIcon from '../../media/CloseIcon.svg';

const ProfessorDashboardView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const user = useMyUser();
    const course = useCourse(courseId);
    const [viewOnlyMode, setViewOnlyMode] = useState(true);
    const [addedUsers, setAddedUsers] = useState<string[]>([]);
    const [missingUsers, setMissingUsers] = useState<string[]>([]);
    

    const cancel = () => {
        setViewOnlyMode(true);
    }

    const hide = () => {
        setAddedUsers([]);
        setMissingUsers([]);
        setViewOnlyMode(false);
    }

    const getAddedUsersList = (emails: string[]) => { 
        setAddedUsers(emails);
    }

    const getMissingUsers = (emails: string[]) => {   
        setMissingUsers(emails);
    }

    const closeMessage = () => {
        
        setMissingUsers([]);
        setAddedUsers([]);
    }

    return (
        
        <div className="ProfessorView">
            <ProfessorSidebar courseId={courseId} code={course ? course.code : 'Loading'} selected={'roles'} />
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
                        {(missingUsers.length !== 0 || addedUsers.length !== 0) &&
                            <div className="UploadPopUpMessageWrap">
                                <div className="UploadPopUpMessage">
                                    <p>{addedUsers.length !== 0 && 'Successfully added: ' + addedUsers.join(', ')}
                                        {addedUsers.length !== 0 && missingUsers.length !== 0 && <br/>}
                                        {missingUsers.length !== 0 && 'Pending: ' + missingUsers.join(', ')}</p>
                                    <img id="MessageCloseIcon" onClick={closeMessage} src={CloseIcon} alt="close"/>
                                </div>
                            </div>}
                        <ProfessorRolesTable courseId={courseId} isAdminView={false}/>
                    </div>
                    : <div className="main">
                        <div className="importProfs">Import Professors/TAs</div>
                        <CSVUploadView 
                            onReturn={cancel} 
                            getAddedUsersList={getAddedUsersList} 
                            getMissingUsers={getMissingUsers} 
                            course={course}
                        />
                    </div>
                }
                
            </section>
        </div>
    );
};
export default ProfessorDashboardView;
