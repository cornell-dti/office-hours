import React, {useState} from 'react';
import { doc, setDoc, Timestamp} from 'firebase/firestore';
import { firestore } from '../../firebase';
import { CURRENT_SEMESTER, START_DATE, END_DATE } from '../../constants';
import { generateInitialWaitTimeMap } from '../../firebasefunctions/waitTimeMap';

const startDate = new Date(START_DATE);
const endDate = new Date(END_DATE);
const currentTerm = CURRENT_SEMESTER.substring(0, 2);
const currentYear = CURRENT_SEMESTER.substring(2, 4);

const AdminCourseCreator = ({ onSubmit }: { readonly onSubmit: () => void }) => {
    const [courseId, setCourseId] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [semester, setSemester] = useState(CURRENT_SEMESTER);
    const [year, setYear] = useState(currentYear);
    const [term, setTerm] = useState(currentTerm);

    const disabled = courseId.trim().length === 0
        || name.trim().length === 0
        || code.trim().length === 0
        || semester.trim().length === 0
        || year.trim().length === 0
        || term.trim().length === 0;

    const onSave = () => {
        if (term !== 'FA' && term !== 'SP') {
            alert('Incorrect term format: enter FA or SP');
            return;
        }
        if (isNaN(year as unknown as number) || year as unknown as number < 0) {
            alert('Please ensure the year is a positive integer!');
            return;
        }
        const course: Omit<FireCourse, 'courseId'> = {
            name,
            code,
            semester,
            year,
            term,
            queueOpenInterval: 30,
            charLimit: 140,
            startDate:Timestamp.fromDate(startDate),
            endDate: Timestamp.fromDate(endDate),
            professors: [],
            tas: []
        };
        // Add waitTimeMap field separately to ensure it's included in Firestore
        // Initialize with all time slots (12 AM - 11:30 PM) for all days of the week
        const courseWithWaitTimeMap = {
            ...course,
            waitTimeMap: generateInitialWaitTimeMap()
        };
        setDoc(doc(firestore, 'courses', courseId), courseWithWaitTimeMap).then(onSubmit);
    };

    return (
        <div className="course">
            <h2>Create New Course</h2>
            <div className="course-section">
                <h3>Course Id</h3>
                <input 
                    type="text" 
                    value={courseId} 
                    onChange={e => setCourseId(e.currentTarget.value)} 
                />
            </div>
            <div className="course-section">
                <h3>Course Name</h3>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.currentTarget.value)} 
                />
            </div>
            <div className="course-section">
                <h3>Course Code</h3>
                <input 
                    type="text" 
                    value={code} 
                    onChange={e => setCode(e.currentTarget.value)} 
                />
            </div>
            <div className="course-section">
                <h3>Year</h3>
                <input 
                    type="text" 
                    value={year} 
                    onChange={e => {
                        setYear(e.currentTarget.value); 
                        setSemester(term + e.currentTarget.value);
                    }} 
                />
            </div>
            <div className="course-section">
                <h3>Term</h3>
                <input 
                    type="text" 
                    value={term} 
                    onChange={e => {
                        setTerm(e.currentTarget.value);
                        setSemester(e.currentTarget.value + year);
                    }} 
                />
            </div>
            <div className="course-section">
                <h3>Semester</h3>
                <div>{semester}</div>
            </div>
            <div className="course-section">
                <h3>Start Date</h3>
                <div>{startDate.toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>End Date</h3>
                <div>{endDate.toLocaleDateString()}</div>
            </div>
            <button type="button" disabled={disabled} onClick={onSave}>Save</button>
        </div>
    );
};

export default AdminCourseCreator;