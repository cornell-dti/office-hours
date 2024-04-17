import React, { useState } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

import { firestore } from '../../firebase';
import { CURRENT_SEMESTER, START_DATE, END_DATE } from '../../constants';

const startDate = new Date(START_DATE);
const endDate = new Date(END_DATE);
const currentTerm = CURRENT_SEMESTER.substring(0, 2);
const currentYear = CURRENT_SEMESTER.substring(2, 4);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
            // eslint-disable-next-line no-alert
            alert('Incorrect term format: enter FA or SP');
            return;
        }
        if (isNaN(Number(year)) || Number(year) < 0) {
            // eslint-disable-next-line no-alert
            alert('Please ensure the year is a positive integer!');
            return;
        }
        const courseDoc: Omit<FireCourse, 'courseId'> = {
            name,
            code,
            semester,
            year,
            term,
            queueOpenInterval: 30,
            charLimit: 140,
            startDate: Timestamp.fromDate(startDate),
            endDate: Timestamp.fromDate(endDate),
            professors: [],
            tas: []
        };
        const courseRef = doc(firestore, 'courses', courseId);
        setDoc(courseRef, courseDoc).then(onSubmit).catch((error) => {
            // eslint-disable-next-line no-console
            console.error("Error saving course: ", error);
            // eslint-disable-next-line no-alert
            alert("Failed to save the course.");
        });
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