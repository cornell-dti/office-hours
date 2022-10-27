import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorRolesTable from '../includes/ProfessorRolesTable';
import ProfessorPendingTable from '../includes/ProfessorPendingTable';
import { useCourse } from '../../firehooks';
import CloseIcon from '../../media/CloseIcon.svg';
import ImportRolesModal from '../includes/ImportRolesModal';

const ProfessorDashboardView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const course = useCourse(courseId);
    // const [viewOnlyMode, setViewOnlyMode] = useState(true);
    const [addedUsers, setAddedUsers] = useState<string[]>([]);
    const [missingUsers, setMissingUsers] = useState<string[]>([]);
    const [showImportModal, setShowImportModal] = useState<boolean>(false);

    const hide = () => {
        setAddedUsers([]);
        setMissingUsers([]);
        setShowImportModal(true);
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
            <TopBar courseId={courseId} context="professor" role="professor" />
            <ImportRolesModal
                getAddedUsersList={getAddedUsersList} 
                getMissingUsers={getMissingUsers} 
                course={course}
                showImportModal={showImportModal}
                setShowImportModal={setShowImportModal}
            />
            <section className="rightOfSidebar">
                <div className="main">
                    <div className="rightHeading">
                        <p className="manageRoles">Manage Roles</p>
                        <button type="button" id="importProf" onClick={hide}>
                            <Icon name="plus" />
                            Import Professors/TAs
                        </button>
                    </div>
                    {(missingUsers.length !== 0 || addedUsers.length !== 0) &&
                        <div className="UploadPopUpMessageWrap">
                            <div className="UploadPopUpMessage">
                                <p>{addedUsers.length !== 0 && 'Successfully added: ' + addedUsers.join(', ')}
                                    {addedUsers.length !== 0 && missingUsers.length !== 0 && <br/>}
                                    {missingUsers.length !== 0 && 
                                      'Pending Account Creation: ' + missingUsers.join(', ')}</p>
                                <img id="MessageCloseIcon" onClick={closeMessage} src={CloseIcon} alt="close"/>
                            </div>
                        </div>}
                    <ProfessorRolesTable courseId={courseId} isAdminView={false}/>
                    <ProfessorPendingTable courseId={courseId}/>
                </div>
                
            </section>
        </div>
    );
};
export default ProfessorDashboardView;
