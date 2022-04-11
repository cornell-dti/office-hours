import React, { Dispatch, SetStateAction, useState, useEffect, useCallback } from "react";

import { Icon } from 'semantic-ui-react';
import ArrowBackIcon from '../../media/back.svg';
import EditIcon from '../../media/edit.svg';
import FileIcon from '../../media/file.svg';
import { importProfessorsOrTAsFromCSV} from '../../firebasefunctions/importProfessorsOrTAs';
// import CSVUploadCheck from '../../media/CSVUploadCheck.svg';
// import CSVInfoIcon from '../../media/CSVInfoIcon.svg';
// import ExampleTable from '../../media/ExampleTable.svg';
// import FileIcon from '../../media/FileIcon.svg';
import CloseIcon from '../../media/CloseIcon.svg';
import WarningIcon from '../../media/WarningIcon.svg';
// import AddEmailIcon from '../../media/AddEmailIcon.svg';

type PageInfo = {
    header: string;
    leftButton: string;
    rightButton: string;
}

type NewUser = {
    key: number;
    email: string; 
    role: string; 
}

const ImportRolesModal = (
    { onReturn, course, getAddedUsersList, getMissingUsers, showImportModal, setShowImportModal }: 
    { onReturn: () => void; course: FireCourse | undefined; getAddedUsersList: (emails: string[]) => void ; 
        getMissingUsers: (emails: string[]) => void; showImportModal: boolean; setShowImportModal: Dispatch<SetStateAction<boolean>>;}
) => {
    const [uploadType, setUploadType] = useState('none');
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [CSVErrorMessage, setCSVErrorMessage] = useState('none');
    // const [EnterErrorMessage, setEnterErrorMessage] = useState('none');
    const [TAEmailList, setTAEmailList] = useState<string[]>();
    const [professorEmailList, setProfessorEmailList] = useState<string[]>();
    const [newUsers, setNewUsers] = useState<NewUser[]>([{
        key: 0, 
        email: '', 
        role: ''
    }]);
    
    const closeModal = () => {
        setShowImportModal(false);
        setUploadType('none'); 
        setCSVErrorMessage('none');
        setSelectedFile(undefined);
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
                        setCSVErrorMessage('*Your CSV file must contain a header line with at least the Email and Role columns.')
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
                getAddedUsersList(addedEmails);  
                getMissingUsers(missingEmails);                               
            });
        }
    }

    const addTAandProfessors = () => {
        if (course) {
            if (TAEmailList && TAEmailList.length !== 0 && professorEmailList && professorEmailList.length !== 0) {
                importProfessorsOrTAsFromCSV(course, 'ta', TAEmailList)?.then((users) => {
                    const taAddedEmails = users.updatedUsers.map(user => user.email);  
                    const taMissingEmails = Array.from(users.missingSet);  
                    const newCourse = users.courseChange;
                    return {taAddedEmails, taMissingEmails, newCourse}
                }).then((taEmails)=> {
                    const editedCourse = taEmails.newCourse;
                    importProfessorsOrTAsFromCSV(editedCourse, 'professor', professorEmailList)?.then((users) => {
                        const profAddedEmails = users.updatedUsers.map(user => user.email);   
                        const profMissingEmails = Array.from(users.missingSet);  
                        getAddedUsersList(taEmails.taAddedEmails.concat(profAddedEmails));  
                        getMissingUsers(taEmails.taMissingEmails.concat(profMissingEmails));
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

    const finish = () => {
        if (selectedFile && CSVErrorMessage==='none') {
            addTAandProfessors();
            setShowImportModal(false);
            Promise.resolve()
                .then(() => {
                    onReturn();
                    
                });
        }
    }

    useEffect(() => {
        processCSV();
    }, [selectedFile, processCSV])
 
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
                        <div className='CalendarContainer'>
                            <div className='CalendarItem'>
                                <img
                                    src={EditIcon}
                                    alt='Export to Google Calendar'
                                />
                                <div
                                    className='ExportText'
                                    onClick={()=>setUploadType('enter')}
                                >
                                    Export Manually
                                </div>
                            </div>
                            <div className='Line' />
                            <div className='CalendarItem'>
                                <img
                                    src={FileIcon}
                                    alt='Export to Apple Calendar'
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

                        <div className="CSVUploadContainer">
                            {/* <div className="UploadMessage">
                                <img src={CSVInfoIcon} alt="info"/>
                                Your CSV file must contain a header line with at least the Email and Role columns.
                            </div>
                            <img style={{width: "60%"}} src={ExampleTable} alt="table"/> */}

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
                                    {/* <div className="File">
                                        {selectedFile? 
                                            <div className="FileName">
                                                <a 
                                                    href={URL.createObjectURL(selectedFile)} 
                                                    download={selectedFile?.name} 
                                                    id={CSVErrorMessage === 'none'? 'FileLink' : 'FileLinkRed'}
                                                >
                                                    {selectedFile.name.substr(0, 20) + "\u2026"}
                                                </a> 
                                                <img onClick={()=> setSelectedFile(undefined)} src={CloseIcon} alt="close"/>
                                            </div>
                                            : <p>no file chosen</p>}
                                        <p id="FileType">File Types: .csv .xlsx</p> 
                                    </div> */}
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

                            <button type="button" className="ConfirmButton" onClick={finish}>CONFIRM &amp; FINISH  &gt;</button>

                        </div>

                    </div>
                </div>
            }

        </>
    )
}

export default ImportRolesModal;