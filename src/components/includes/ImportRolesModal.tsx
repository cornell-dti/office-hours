import React, { Dispatch, SetStateAction, useState, useEffect, useCallback } from "react";
import '../../styles/professor/ImportRoles.scss'

import { Dropdown, Icon } from 'semantic-ui-react';
import ArrowBackIcon from '../../media/back.svg';
import EditIcon from '../../media/edit.svg';
import FileIcon from '../../media/file.svg';
import DeleteIcon from '../../media/trash.svg';
import { importProfessorsOrTAsFromCSV} from '../../firebasefunctions/importProfessorsOrTAs';
import CloseIcon from '../../media/CloseIcon.svg';
import AddEmailIcon from '../../media/AddEmailIcon.svg';

type NewUser = {
    key: number;
    email: string; 
    role: string; 
}

const ImportRolesModal = (
    { course, getAddedUsersList, getMissingUsers, getDemotedUsers, showImportModal, setShowImportModal }: 
    { course: FireCourse | undefined; 
        getAddedUsersList: (emails: string[]) => void ; 
        getMissingUsers: (emails: string[]) => void; 
        getDemotedUsers: (emails: string[]) => void; 
        showImportModal: boolean; 
        setShowImportModal: Dispatch<SetStateAction<boolean>>;}
) => {
    const [uploadType, setUploadType] = useState('none');
    const [EnterErrorMessage, setEnterErrorMessage] = useState('none');
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [CSVErrorMessage, setCSVErrorMessage] = useState('none');
    const [TAEmailList, setTAEmailList] = useState<string[]>();
    const [professorEmailList, setProfessorEmailList] = useState<string[]>();
    const [newUsers, setNewUsers] = useState<NewUser[]>([
        {
            key: 0, 
            email: '', 
            role: 'Professor'
        },
        {
            key: 1, 
            email: '', 
            role: 'Professor'
        },
        {
            key: 2, 
            email: '', 
            role: 'Professor'
        },
    ]);
    
    const closeModal = () => {
        setShowImportModal(false);
        setNewUsers([{
            key: 0, 
            email: '', 
            role: 'Professor'
        },
        {
            key: 1, 
            email: '', 
            role: 'Professor'
        },
        {
            key: 2, 
            email: '', 
            role: 'Professor'
        }]);
        setUploadType('none'); 
        setCSVErrorMessage('none');
        setSelectedFile(undefined);
        setTAEmailList([]);
        setProfessorEmailList([]);
    }

    const back = () => {
        setUploadType('none'); 
        setCSVErrorMessage('none'); 
        setSelectedFile(undefined);
    }

    const isValidEmail = (email: string) => {
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) return true;
        return false;
    }

    const isShown = showImportModal ? 'Visible' : '';

    const fileDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
    }

    const fileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        setSelectedFile(file);                            
    }

    const fileUploadButton = () => {
        document?.getElementById('fileButton')?.click();
    }

    const fileInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault();
        const file = event.target.files?.item(0);
        event.target.value = '';        
        if (file) setSelectedFile(file);  
        setCSVErrorMessage('none');
    }

    const processCSV = useCallback(() => {
        setCSVErrorMessage('none');
        if (selectedFile) {
            const type = selectedFile.type;
            
            if (type !== 'text/csv' && type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
            type !== 'application/vnd.ms-excel') {                
                setCSVErrorMessage('*Wrong file type: must be .csv or .xlsx');
                return;
            }

            const reader = new FileReader(); 
            reader.readAsText(selectedFile);
            reader.onload = (e) => {
                const csv = e.target?.result?.toString().trim();
                const data = csv?.split(/\r\n|\n/);
                
                if (data) {
                    const header = data[0].split(',');
                    if (header.length !== 2) {
                        setCSVErrorMessage(
                            '*Your CSV file must contain a header line with at least the Email and Role columns.')
                        return;
                    }                    

                    data.slice(1).forEach(user => {
                        const userData = user.split(',');
                        const email = userData[0].trim();

                        if (userData.length !== 2) {
                            setCSVErrorMessage('*Invalid format')
                            return;
                        }

                        if (!isValidEmail(email)) {
                            setCSVErrorMessage('*Invalid Email Address');
                        } 
                    });

                    const TAList = data.filter(user => user.split(',')[1] === 'TA');
                    const professorList = data.filter(user => user.split(',')[1] === 'Professor');

                    if (TAList.length + professorList.length !== data.length - 1) {
                        setCSVErrorMessage('*Please enter valid roles only (TA or Professor)');
                    }

                    const TAEmailList = TAList.map(user => user.split(',')[0].trim().toLowerCase());
                    const professorEmailList = professorList.map(user => user.split(',')[0].trim().toLowerCase());
                    setTAEmailList(TAEmailList);
                    setProfessorEmailList(professorEmailList);
                }                
            }
        }     
    }, [selectedFile]);

    const getProfOrTAEmailList = (role: 'professor' | 'ta') => {
        const list = role === 'ta'? TAEmailList : professorEmailList;
        if (course && list) {
            importProfessorsOrTAsFromCSV(course, role, list)?.then((users) => {
                const addedEmails = users.updatedUsers.map(user => user.email);   
                const missingEmails = Array.from(users.missingSet);  
                const demotedEmails = Array.from(users.demotedSet);
                getAddedUsersList(addedEmails);  
                getMissingUsers(missingEmails);  
                getDemotedUsers(demotedEmails)                             
            });
        }
    }

    const addTAandProfessors = () => {
        if (course) {
            if (TAEmailList && TAEmailList.length !== 0 && professorEmailList && professorEmailList.length !== 0) {
                importProfessorsOrTAsFromCSV(course, 'ta', TAEmailList)?.then((users) => {
                    const taAddedEmails = users.updatedUsers.map(user => user.email);  
                    const taMissingEmails = Array.from(users.missingSet); 
                    const taDemotedEmails = Array.from(users.demotedSet); 
                    const newCourse = users.courseChange;
                    return {taAddedEmails, taMissingEmails, taDemotedEmails, newCourse}
                }).then((taEmails)=> {
                    const editedCourse = taEmails.newCourse;
                    importProfessorsOrTAsFromCSV(editedCourse, 'professor', professorEmailList)?.then((users) => {
                        const profAddedEmails = users.updatedUsers.map(user => user.email);   
                        const profMissingEmails = Array.from(users.missingSet);  
                        const profDemotedEmails = Array.from(users.demotedSet);
                        getAddedUsersList(taEmails.taAddedEmails.concat(profAddedEmails));  
                        getMissingUsers(taEmails.taMissingEmails.concat(profMissingEmails));
                        getDemotedUsers(taEmails.taDemotedEmails.concat(profDemotedEmails));
                    });
                });
            }
                
            if (professorEmailList && professorEmailList.length !== 0 && (!TAEmailList || 
                TAEmailList?.length === 0)) {
                getProfOrTAEmailList('professor'); 
            } 

            if (TAEmailList && TAEmailList.length !== 0 && (!professorEmailList || 
                professorEmailList?.length === 0)) {                
                getProfOrTAEmailList('ta');
            }
        }
    }

    const finishEnter = () => {
        if (EnterErrorMessage === 'none') {
            addTAandProfessors();
            closeModal();
        }
    }

    const finishCSV = () => {
        if (selectedFile && CSVErrorMessage==='none') {
            addTAandProfessors();
            closeModal();
        }
    }

    const handleUpdateUsers = (event: React.ChangeEvent<HTMLInputElement>, key: number): void => {
        const value = event.target.value;
        const name = event.target.id;
        const updatedUser = {
            ...newUsers[key],
            [name]: value
        }

        const beginning = newUsers.slice(0, key); 
        const end = newUsers.slice(key+ 1)

        setNewUsers([...beginning, updatedUser, ...end])      
    }

    const deleteRow = (key: number) => {
        const updatedUser = newUsers.filter((user) => user.key !== key)
        for (let i = key; i <updatedUser.length; i++) {
            updatedUser[i].key = i;
        }
        setNewUsers(updatedUser)
    }

    const addNewCell = () => {
        const newEmptyUser = {
            key: newUsers.length, 
            email: '',
            role: 'Professor'
        }

        setNewUsers([...newUsers, newEmptyUser]);
    }

    const RoleDropdown = ({
        user,
    }: {
        readonly user: NewUser;
    }) => {
        return (
            <Dropdown
                className='RoleOptions'
                options={[
                    { key: 1, text: 'Professor', value: 'Professor' },
                    { key: 2, text: 'TA', value: 'TA' },
                ]}
                defaultValue={user.role}
                onChange={(e, newValue) => {
                    const value = newValue.value as string;
                    const updatedUser = {
                        ...newUsers[user.key],
                        role: value
                    }
                    const begining = newUsers.slice(0, user.key); 
                    const end = newUsers.slice(user.key+ 1)

                    setNewUsers([...begining, updatedUser, ...end])  
                }}
            />
        );
    };

    useEffect(() => {
        processCSV();
    }, [selectedFile, processCSV])

    useEffect(() => {
        const processListOfUsers = () => {
            setEnterErrorMessage('none');
            if (newUsers.length === 0) {
                setEnterErrorMessage('Enter an email and role to add');
            }
            newUsers.forEach(user => {
                const role = user.role.trim();
                const email = user.email.trim();
                if (role === '' && email === '') {
                    if (user.key !== 0) {
                        setNewUsers([...newUsers.slice(0, user.key), ...newUsers.slice(user.key+1)]);
                    }
                } else if (email === '') {
                    setEnterErrorMessage('Enter an email for each role');
                } else if (!isValidEmail(email)) {
                    setEnterErrorMessage('Enter valid email for each role');
                } else if (role !== 'Professor' && role !== 'TA') {
                    setEnterErrorMessage('Enter valid roles (either "Professor" or "TA")');
                }
    
                const TAList = newUsers.filter(user => user.role === 'TA'); 
                const professorList = newUsers.filter(user => user.role === 'Professor')
    
                const TAEmailList = TAList.map(user => user.email.toLowerCase());
                const professorEmailList = professorList.map(user => user.email.toLowerCase());
    
                setTAEmailList(TAEmailList);
                setProfessorEmailList(professorEmailList);
                
            })
        }
        processListOfUsers();
    }, [newUsers])
 
    return (
        <>
            {showImportModal && uploadType === 'none' &&
                <div className='ImportRolesModalScreen'>
                    <div className={'ImportRolesModal' + isShown}>
                        <button
                            type='button'
                            className='closeButton'
                            onClick={closeModal}
                        >
                            <Icon name='x' />
                        </button>
                        <div className='Title'>Import Professors/TAs</div>
                        <div className='ImportContainer'>
                            <div className='ImportItem'>
                                <img
                                    src={EditIcon}
                                    alt='Enter Manually'
                                />
                                <div
                                    className='ExportText'
                                    onClick={()=>setUploadType('enter')}
                                >
                                    Enter Manually
                                </div>
                            </div>
                            <div className='Line' />
                            <div className='ImportItem'>
                                <img
                                    src={FileIcon}
                                    alt='Upload CSV'
                                />
                                <div
                                    className='ExportText'
                                    onClick={()=>setUploadType('csv')}
                                >
                                    Upload CSV
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {showImportModal && uploadType === 'csv' &&
                <div className='CSVUploadScreen'>
                    <div className='CSVModal'>
                        <div>
                            <button
                                type='button'
                                className='backButton'
                                onClick={back}
                            >
                                <img
                                    src={ArrowBackIcon}
                                    alt='Back'
                                />
                            </button>
                            <button
                                type='button'
                                className='closeButton'
                                onClick={closeModal}
                            >
                                <Icon name='x' />
                            </button>
                        </div>
                        <div className='Title'>Upload CSV file</div>

                        <div className="CSVContainer">
                            <div className="SelectFileBox">
                                <div className="SelectFile">
                                    <p>File:</p>
                                    <div>
                                        <input
                                            id="fileButton"
                                            type="file"
                                            onChange={fileInput}
                                            hidden 
                                            accept=".csv, 
                                            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
                                            application/vnd.ms-excel"
                                        />
                                        <button type="button" className="ChooseFile" onClick={fileUploadButton}>
                                        Choose File
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {CSVErrorMessage !== 'none' && <div className="ErrorMessage">
                                {CSVErrorMessage}
                            </div>}

                            <div className="DragDrop" onDrop={(e) => fileDrop(e)} onDragOver={(e) => fileDragOver(e)}>
                                {selectedFile && CSVErrorMessage === 'none'? 
                                    <div>
                                        <img src={FileIcon} alt="file"/>
                                        <div className="FileName">
                                            <a 
                                                href={URL.createObjectURL(selectedFile)} 
                                                download={selectedFile?.name} 
                                                id="FileLink"
                                            >
                                                {selectedFile.name.length < 30? selectedFile.name :
                                                    selectedFile.name.substr(0, 30) + "\u2026"}
                                            </a> 
                                            <img onClick={()=> setSelectedFile(undefined)} src={CloseIcon} alt="close"/>
                                        </div>
                                    </div>

                                    : 
                                    <div>
                                        <p className="DropHere">Drag and drop your file here</p>
                                        <p className="FileTypes">File Types: .csv .xlsx</p>
                                    </div>}
                            </div>   

                            <button type="button" className="ConfirmButton" onClick={finishCSV}>
                                CONFIRM &amp; FINISH  &gt;
                            </button>

                        </div>

                    </div>
                </div>
            }

            {showImportModal && uploadType === 'enter' && 
                <div className="ManualUploadScreen">
                    <div className='EnterModal'>
                        <div>
                            <button
                                type='button'
                                className='backButton'
                                onClick={back}
                            >
                                <img
                                    src={ArrowBackIcon}
                                    alt='Back'
                                />
                            </button>
                            <button
                                type='button'
                                className='closeButton'
                                onClick={closeModal}
                            >
                                <Icon name='x' />
                            </button>
                        </div>
                        <div className='Title'>Enter email(s) and roles manually</div>
                        {EnterErrorMessage !== 'none' && <div className="ErrorMessage">
                            {EnterErrorMessage}
                        </div>}
                        <div className="EnterContainer">
                            <div className={newUsers.length < 3? "ColTitles" : "ColTitlesScroll"}>
                                <p>Enter Email</p>
                                <p>Select Role</p>
                            </div>
                            <div className="RolesTable">
                                <table className={newUsers.length >= 3? "ScrollTable" : ""} >
                                    <tbody>
                                        {newUsers.map(user => {
                                            return (<tr key={user.key}> 
                                                <td>
                                                    <input 
                                                        id="email" 
                                                        value={user.email} 
                                                        onChange={(e) => {
                                                            handleUpdateUsers(e, user.key)
                                                        }} 
                                                        placeholder='example@cornell.edu'
                                                        autoComplete="off"
                                                    />
                                                </td>
                                                <td>
                                                    <RoleDropdown
                                                        user={user}
                                                    />

                                                </td>
                                                <td>
                                                    <img
                                                        src={DeleteIcon}
                                                        alt='Delete role'
                                                        onClick={() => deleteRow(user.key)}
                                                    />
                                                </td>
                                            </tr>
                                            
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <img className="AddButton" onClick={addNewCell} src={AddEmailIcon} alt="add"/>
                            <button type="button" className="ConfirmButton" onClick={finishEnter}>
                                CONFIRM &amp; FINISH  &gt;
                            </button>
                        </div>
                    </div>
                </div>

            }

        </>
    )
}

export default ImportRolesModal;