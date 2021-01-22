import React, { useState, useEffect } from "react";
import { importProfessorsOrTAsFromCSV} from '../../firebasefunctions';
import { firestore } from '../../firebase';
import CSVUploadCheck from '../../media/CSVUploadCheck.svg';
import CSVInfoIcon from '../../media/CSVInfoIcon.svg';
import ExampleTable from '../../media/ExampleTable.svg';
import FileIcon from '../../media/FileIcon.svg';
import CloseIcon from '../../media/CloseIcon.svg';
import WarningIcon from '../../media/WarningIcon.svg';
import AddEmailIcon from '../../media/AddEmailIcon.svg';

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

const CSVUploadView = (
    { onReturn, course }: 
    { onReturn: () => void; course: FireCourse | undefined }
) => {
    const [pageIndex, setPageIndex] = useState(0);
    const [uploadType, setUploadType] = useState('none');
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [CSVErrorMessage, setCSVErrorMessage] = useState('none');
    const [EnterErrorMessage, setEnterErrorMessage] = useState('none');
    const [TAEmailList, setTAEmailList] = useState<string[]>();
    const [professorEmailList, setProfessorEmailList] = useState<string[]>();
    const [newUsers, setNewUsers] = useState<NewUser[]>([{
        key: 0, 
        email: '', 
        role: ''
    }]);


    const pageInfos: PageInfo[] = [
        { 
            header: "Step 1: Select a Format", 
            leftButton: "Cancel",
            rightButton: "Next"
        },
        {
            header: "Step 2: Upload a CSV File",
            leftButton: "Previous",
            rightButton: "Next"
        },
        {
            header: "Step 3: View and Confirm",
            leftButton: "Cancel and Re-upload",
            rightButton: "Finish"
        }
    ]

    useEffect(()=> {
        processCSV();
    }, [selectedFile])

    const next = () => {
        if (pageIndex === 0 && uploadType === 'none') return; 
        if (pageIndex === 1 && uploadType === 'csv' && !selectedFile) return;
        if (pageIndex === 1 && CSVErrorMessage !== 'none') return;
        if (uploadType === 'enter' && pageIndex === 1) processListOfUsers()

        if (pageIndex === 2) {
            if (course) {
                if (TAEmailList && TAEmailList?.length !== 0) {
                    importProfessorsOrTAsFromCSV(firestore, course, 'ta', TAEmailList); 
                }
                if (professorEmailList && professorEmailList?.length !== 0) {
                    importProfessorsOrTAsFromCSV(firestore, course, 'professor', professorEmailList);
                }
            }
        }        
        
        if (pageIndex < pageInfos.length - 1) {
            setPageIndex(pageIndex + 1);
        } else {
            Promise.resolve()
                .then(() => {
                    onReturn();
                });
        }

    }

    const isValidEmail = (email: string) => {
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) return true;
        return false;
    }

    const processCSV = async() => {
        if (selectedFile) {
            const reader = new FileReader(); 
            reader.readAsText(selectedFile);
            reader.onload = (e) => {
                const csv = e.target?.result?.toString().trim();
                const data = csv?.split(/\r\n|\n/);
                
                if (data) {
                    const header = data[0].split(',');
                    if (header.length !== 2) {
                        setCSVErrorMessage('Header contains more than two columns')
                        return;
                    }                    

                    data.slice(1).forEach(user => {
                        const userData = user.split(',');
                        
                        if (!isValidEmail(userData[0].trim())) {
                            console.log(userData[0]);
                            setCSVErrorMessage('Invalid Email Address');
                            return;
                        } 

                        if (userData.length !== 2) {
                            setCSVErrorMessage('Invalid format')
                            return;
                        }
                    })

                    const TAList = data.filter(user => user.split(',')[1] === 'TA');
                    const professorList = data.filter(user => user.split(',')[1] === 'Professor');

                    if (TAList.length + professorList.length !== data.length - 1) {
                        setCSVErrorMessage('Please enter valid roles only (TA or Professor)');
                    }

                    const TAEmailList = TAList.map(user => user.split(',')[0].trim());
                    const professorEmailList = professorList.map(user => user.split(',')[0].trim());

                    setTAEmailList(TAEmailList);
                    setProfessorEmailList(professorEmailList);
                }                
            }
        }     
    }

    const previous = () => {
        if (pageIndex === 0) {
            onReturn();
        } else {
            setPageIndex(pageIndex - 1);
        }
    }

    const fileUploadButton = () => {
        document?.getElementById('fileButton')?.click();
    }

    const fileInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.item(0);
        if (file) setSelectedFile(file);  
        setCSVErrorMessage('none');
    }

    const addNewCell = () => {
        const newEmptyUser = {
            key: newUsers.length,
            email: '',
            role: ''
        }

        setNewUsers([...newUsers, newEmptyUser]);
    }

    const handleUpdateUsers = (event: React.ChangeEvent<HTMLInputElement>, key: number): void => {
        const value = event.target.value;
        const name = event.target.id;
        const updatedUser = {
            ...newUsers[key],
            [name]: value
        }

        const begining = newUsers.slice(0, key); 
        const end = newUsers.slice(key+ 1)

        setNewUsers([...begining, updatedUser, ...end])

        // console.log(newUsers);
        
    }

    const processListOfUsers = () => {
        console.log(newUsers);
        
        newUsers.forEach(user => {
            if (user.role === '' && user.email === '') {
                setNewUsers([...newUsers.slice(0, user.key), ...newUsers.slice(user.key+1)]);
            } else if (user.email === '') {
                setEnterErrorMessage('Enter an email for each role specified');
            } else if (user.role !== 'Professor' && user.role !== 'TA') {
                setEnterErrorMessage('Enter valid roles (either "Professor" or "TA")');
            } 

            const TAList = newUsers.filter(user => user.role === 'TA'); 
            const professorList = newUsers.filter(user => user.role === 'Professor')

            const TAEmailList = TAList.map(user => user.email);
            const professorEmailList = professorList.map(user => user.email);

            setTAEmailList(TAEmailList);
            setProfessorEmailList(professorEmailList);
        
        })
    }

    return (
        <div className="CSVWrap">
            <div className="CSVBox">
                <div className="HeadContainer">
                    <div>
                        {uploadType === 'enter' && pageIndex === 1 ? 
                            'Step 2: Enter Email(s)' : pageInfos[pageIndex].header}
                    </div>
                </div>
                <div className="StepBody">
                    
                    {pageIndex === 0 && 
                    <div className="UploadBoxes">
                        <div 
                            onClick={()=>setUploadType('enter')} 
                            className={uploadType === 'enter' ? "CheckedUploadBox" :"UploadBox"}
                        >
                            Enter Professor/TA email(s)
                            {uploadType === 'enter' && <img src={CSVUploadCheck} alt="check"/>}
                        </div>

                        <div 
                            onClick={()=>setUploadType('csv')} 
                            className={uploadType === 'csv' ? "CheckedUploadBox" :"UploadBox"}
                        >
                            Upload CSV File 
                            {uploadType === 'csv' && <img src={CSVUploadCheck} alt="check"/>}
                        </div>
                    </div>}

                    {pageIndex === 1 && uploadType === 'csv' &&
                    <div className="CSVUpload">
                        <div className="UploadMessage">
                            <img src={CSVInfoIcon} alt="info"/>
                            Your CSV file must contain a header line with at least the Email and Role columns.
                        </div>
                        <img style={{width: "60%"}} src={ExampleTable} alt="table"/>
                        <div className="DragDrop" onDrop={fileUploadButton}>
                            {selectedFile && CSVErrorMessage === 'none'? 
                                <div>
                                    <img src={FileIcon} alt="file"/>
                                    <div className="FileName">
                                        <a 
                                            href={URL.createObjectURL(selectedFile)} 
                                            download={selectedFile?.name} 
                                            id="FileLink"
                                        >
                                            {selectedFile.name.length < 100? selectedFile.name :
                                                selectedFile.name.substr(0, 40) + "\u2026"}
                                        </a> 
                                        <img onClick={()=> setSelectedFile(undefined)} src={CloseIcon} alt="close"/>
                                    </div>
                                </div>

                                : 'Drag and drop your file here'}
                            
                        </div>
                        <p>OR</p>
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
                                <div className="File">
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
                                </div>
                            </div>
                        </div>
                        {CSVErrorMessage !== 'none' && <div className="ErrorMessage">
                            <img src={WarningIcon} alt="warning"/>
                            {CSVErrorMessage}
                        </div>}
                    </div>}

                    {pageIndex === 1 && uploadType === 'enter' &&
                    <div className="EnterEmails">
                        <div className="UploadMessage">
                            <img src={CSVInfoIcon} alt="info"/>
                            The only acceptable roles are "Professor" and "TA"
                        </div>
                        <div className="RolesTable">
                            <table>
                                <thead>
                                    <tr id="TableHeader">
                                        <th>Email</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>  

                                <tbody>
                                    {newUsers.map(user => {
                                        return (<tr key={user.key}>                                   
                                            <th>
                                                <input 
                                                    id="email" 
                                                    value={user.email} 
                                                    onChange={(e) => handleUpdateUsers(e, user.key)} 
                                                    placeholder={newUsers.length === 1? 
                                                        'Enter professor/TA email here': ''} 
                                                    autoComplete="off"
                                                />
                                            </th>
                                            <th>
                                                <input 
                                                    id="role" 
                                                    value={user.role} 
                                                    onChange={(e) => handleUpdateUsers(e, user.key)} 
                                                    placeholder={newUsers.length === 1? 'Enter role here': ''} 
                                                    autoComplete="off"
                                                />
                                            </th>
                                        </tr>);
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <img onClick={addNewCell} src={AddEmailIcon} alt="add"/>
                    </div>}

                    {pageIndex === 2 && 
                    <div className="FinalStep">
                        {(TAEmailList?.length !== 0 || professorEmailList?.length !== 0) &&
                        <>
                            <p>Newly added Professors and TAs</p> 
                            <div className="RolesTable">
                                <table>
                                    <thead>
                                        <tr id="TableHeader">
                                            <th>Email</th>
                                            <th>Role</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {TAEmailList?.map((email, i) => {
                                            return (<tr key={i}>
                                                <th>{email}</th>
                                                <th>TA</th>
                                            </tr>)}
                                        )}

                                        {professorEmailList?.map((email, i) => {
                                            return (<tr key={i}>
                                                <th>{email}</th>
                                                <th>Professor</th>
                                            </tr>)}
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>}
                        {EnterErrorMessage !== 'none' && 
                        <div className="ErrorMessage">
                            <img src={WarningIcon} alt="warning"/>
                            {EnterErrorMessage}
                        </div>}
                    </div>}
                    
                    
                </div>
                <div className="StepControls">
                    <button type="button" className="leftbutton" onClick={previous}>{pageInfos[pageIndex].leftButton}
                    </button>
                    <div className="dots">
                        <span className={pageIndex === 0 ? "ondot":"offdot"}> </span>
                        <span className={pageIndex === 1 ? "ondot":"offdot"}> </span>
                        <span className={pageIndex === 2 ? "ondot":"offdot"}> </span>
                    </div>
                    <button 
                        type="button" 
                        className={(
                            pageIndex === 0 && uploadType === 'none') || 
                            (pageIndex === 1 && !selectedFile && uploadType === 'csv') || 
                            (pageIndex === 1 && CSVErrorMessage !== 'none')
                            ? 'rightbutton': 'selectableButton'} 
                        onClick={next}
                    >
                        {pageInfos[pageIndex].rightButton}</button>
                </div>
            </div>
            
        </div>
    )
}

export default CSVUploadView;