import React, { Dispatch, SetStateAction } from "react";
//useState, useEffect, useCallback

import { Icon } from 'semantic-ui-react';
import EditIcon from '../../media/edit.svg';
import FileIcon from '../../media/file.svg';
// import { importProfessorsOrTAsFromCSV} from '../../firebasefunctions/importProfessorsOrTAs';
// import CSVUploadCheck from '../../media/CSVUploadCheck.svg';
// import CSVInfoIcon from '../../media/CSVInfoIcon.svg';
// import ExampleTable from '../../media/ExampleTable.svg';
// import FileIcon from '../../media/FileIcon.svg';
// import CloseIcon from '../../media/CloseIcon.svg';
// import WarningIcon from '../../media/WarningIcon.svg';
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

type Props = {
    showImportModal: boolean;
    setShowImportModal: Dispatch<SetStateAction<boolean>>;
}

const ImportRolesModal = (
    // { onReturn, course, getAddedUsersList, getMissingUsers }: 
    // { onReturn: () => void; course: FireCourse | undefined; getAddedUsersList: (emails: string[]) => void ; 
    //     getMissingUsers: (emails: string[]) => void; }, 
    {showImportModal, setShowImportModal}: Props
) => {
    // const [pageIndex, setPageIndex] = useState(0);
    // const [uploadType, setUploadType] = useState('none');
    // const [selectedFile, setSelectedFile] = useState<File | undefined>();
    // const [CSVErrorMessage, setCSVErrorMessage] = useState('none');
    // const [EnterErrorMessage, setEnterErrorMessage] = useState('none');
    // const [TAEmailList, setTAEmailList] = useState<string[]>();
    // const [professorEmailList, setProfessorEmailList] = useState<string[]>();
    // const [newUsers, setNewUsers] = useState<NewUser[]>([{
    //     key: 0, 
    //     email: '', 
    //     role: ''
    // }]);
    
    const closeModal = () => {
        setShowImportModal(false);
    }

    const isShown = showImportModal ? 'Visible' : '';

    // const pageInfos: PageInfo[] = [
    //     { 
    //         header: "Step 1: Select a Format", 
    //         leftButton: "Cancel",
    //         rightButton: "Next"
    //     },
    //     {
    //         header: "Step 2: Upload a CSV File",
    //         leftButton: "Previous",
    //         rightButton: "Next"
    //     },
    //     {
    //         header: "Step 3: View and Confirm",
    //         leftButton: "Cancel and Re-upload",
    //         rightButton: "Finish"
    //     }
    // ]

    // const getProfOrTAEmailList = (role: 'professor' | 'ta') => {
    //     const list = role === 'ta'? TAEmailList : professorEmailList;
    //     if (course && list) {
    //         importProfessorsOrTAsFromCSV(course, role, list)?.then((users) => {
    //             const addedEmails = users.updatedUsers.map(user => user.email);   
    //             const missingEmails = Array.from(users.missingSet);  
    //             getAddedUsersList(addedEmails);  
    //             getMissingUsers(missingEmails);                               
    //         });
    //     }
    // }

    // const addTAandProfessors = () => {
    //     if (course) {
    //         if (TAEmailList && TAEmailList.length !== 0 && professorEmailList && professorEmailList.length !== 0) {
    //             importProfessorsOrTAsFromCSV(course, 'ta', TAEmailList)?.then((users) => {
    //                 const taAddedEmails = users.updatedUsers.map(user => user.email);  
    //                 const taMissingEmails = Array.from(users.missingSet);  
    //                 const newCourse = users.courseChange;
    //                 return {taAddedEmails, taMissingEmails, newCourse}
    //             }).then((taEmails)=> {
    //                 const editedCourse = taEmails.newCourse;
    //                 importProfessorsOrTAsFromCSV(editedCourse, 'professor', professorEmailList)?.then((users) => {
    //                     const profAddedEmails = users.updatedUsers.map(user => user.email);   
    //                     const profMissingEmails = Array.from(users.missingSet);  
    //                     getAddedUsersList(taEmails.taAddedEmails.concat(profAddedEmails));  
    //                     getMissingUsers(taEmails.taMissingEmails.concat(profMissingEmails));
    //                 });
    //             });
    //         }
                
    //         if (professorEmailList && professorEmailList.length !== 0 && (!TAEmailList || 
    //             TAEmailList?.length === 0)) {
    //             getProfOrTAEmailList('professor'); 
    //         } 

    //         if (TAEmailList && TAEmailList.length !== 0 && (!professorEmailList || 
    //             professorEmailList?.length === 0)) {                
    //             getProfOrTAEmailList('ta');
    //         }
    //     }
    // }
  
    // const next = () => {
    //     if (!canClickNext()) return;
    //     if (uploadType === 'enter' && pageIndex === 1) processListOfUsers();
    //     if (pageIndex === 2) addTAandProfessors();       

    //     if (pageIndex < pageInfos.length - 1) {
    //         setPageIndex(pageIndex + 1);
    //     } else {
    //         Promise.resolve()
    //             .then(() => {
    //                 onReturn();
                    
    //             });
    //     }
    // }

    // const canClickNext = () => {
    //     if (pageIndex === 0 && uploadType === 'none') return false;
    //     if (pageIndex === 1 && uploadType === 'csv' && !selectedFile) return false; 
    //     if (pageIndex === 1 && uploadType === 'csv' && CSVErrorMessage !== 'none') return false; 
    //     if (pageIndex === 2 && uploadType === 'enter' && EnterErrorMessage !== 'none') return false; 
    //     if (pageIndex === 2 && TAEmailList?.length === 0 && professorEmailList?.length === 0) return false; 

    //     return true
    // }

    // const previous = () => {
    //     if (pageIndex === 0) {
    //         onReturn();
    //     } else {
    //         setPageIndex(pageIndex - 1);
    //     }
    // }

    // const isValidEmail = (email: string) => {
    //     if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) return true;
    //     return false;
    // }

    // const fileUploadButton = () => {
    //     document?.getElementById('fileButton')?.click();
    // }

    // const fileInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    //     event.preventDefault();
    //     const file = event.target.files?.item(0);
    //     event.target.value = '';        
    //     if (file) setSelectedFile(file);  
    //     setCSVErrorMessage('none');
    // }

    // const addNewCell = () => {
    //     const newEmptyUser = {
    //         key: newUsers.length,
    //         email: '',
    //         role: ''
    //     }

    //     setNewUsers([...newUsers, newEmptyUser]);
    // }

    // const handleUpdateUsers = (event: React.ChangeEvent<HTMLInputElement>, key: number): void => {
    //     const value = event.target.value;
    //     const name = event.target.id;
    //     const updatedUser = {
    //         ...newUsers[key],
    //         [name]: value
    //     }

    //     const begining = newUsers.slice(0, key); 
    //     const end = newUsers.slice(key+ 1)

    //     setNewUsers([...begining, updatedUser, ...end])        
    // }

    // const processCSV = useCallback(() => {
    //     setCSVErrorMessage('none');
    //     if (selectedFile) {
    //         const type = selectedFile.type;
            
    //         if (type !== 'text/csv' && type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
    //         type !== 'application/vnd.ms-excel') {                
    //             setCSVErrorMessage('Wrong file type: must be .csv or .xlsx');
    //             return;
    //         }

    //         const reader = new FileReader(); 
    //         reader.readAsText(selectedFile);
    //         reader.onload = (e) => {
    //             const csv = e.target?.result?.toString().trim();
    //             const data = csv?.split(/\r\n|\n/);
                
    //             if (data) {
    //                 const header = data[0].split(',');
    //                 if (header.length !== 2) {
    //                     setCSVErrorMessage('Header contains more than two columns')
    //                     return;
    //                 }                    

    //                 data.slice(1).forEach(user => {
    //                     const userData = user.split(',');
    //                     const email = userData[0].trim();

    //                     if (userData.length !== 2) {
    //                         setCSVErrorMessage('Invalid format')
    //                         return;
    //                     }

    //                     if (!isValidEmail(email)) {
    //                         setCSVErrorMessage('Invalid Email Address');
                            
    //                     } 
    //                 });

    //                 const TAList = data.filter(user => user.split(',')[1] === 'TA');
    //                 const professorList = data.filter(user => user.split(',')[1] === 'Professor');

    //                 if (TAList.length + professorList.length !== data.length - 1) {
    //                     setCSVErrorMessage('Please enter valid roles only (TA or Professor)');
    //                 }

    //                 const TAEmailList = TAList.map(user => user.split(',')[0].trim().toLowerCase());
    //                 const professorEmailList = professorList.map(user => user.split(',')[0].trim().toLowerCase());
    //                 setTAEmailList(TAEmailList);
    //                 setProfessorEmailList(professorEmailList);
    //             }                
    //         }
    //     }     
    // }, [selectedFile]);

    // const processListOfUsers = () => {
    //     setEnterErrorMessage('none');
    //     newUsers.forEach(user => {
    //         const role = user.role.trim();
    //         const email = user.email.trim();
    //         if (role === '' && email === '') {
    //             if (user.key !== 0) {
    //                 setNewUsers([...newUsers.slice(0, user.key), ...newUsers.slice(user.key+1)]);
    //             }
    //         } else if (email === '') {
    //             setEnterErrorMessage('Enter an email for each role specified');
    //         } else if (!isValidEmail(email)) {
    //             setEnterErrorMessage('Enter valid email for each role');
    //         } else if (role !== 'Professor' && role !== 'TA') {
    //             setEnterErrorMessage('Enter valid roles (either "Professor" or "TA")');
    //         } 

    //         const TAList = newUsers.filter(user => user.role === 'TA'); 
    //         const professorList = newUsers.filter(user => user.role === 'Professor')

    //         const TAEmailList = TAList.map(user => user.email.toLowerCase());
    //         const professorEmailList = professorList.map(user => user.email.toLowerCase());

    //         setTAEmailList(TAEmailList);
    //         setProfessorEmailList(professorEmailList);
        
    //     })
    // }

    // const fileDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    //     e.stopPropagation();
    //     e.preventDefault();
    // }

    // const fileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    //     event.preventDefault();
    //     const file = event.dataTransfer.files[0];
    //     setSelectedFile(file);                            
    // }

    // useEffect(() => {
    //     processCSV();
    // }, [selectedFile, processCSV])


 
    return (
        <>
            {showImportModal &&
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
                                <a
                                    className='ExportText'
                                    // href={getGoogleCalendarLink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Export Manually
                                </a>
                            </div>
                            <div className='Line' />
                            <div className='CalendarItem'>
                                <img
                                    src={FileIcon}
                                    alt='Export to Apple Calendar'
                                />
                                <div
                                    className='ExportText'
                                    // onClick={exportToAppleCalendar}
                                >
                                    Upload CSV
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default ImportRolesModal;