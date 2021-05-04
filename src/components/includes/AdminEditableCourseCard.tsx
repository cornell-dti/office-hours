import React, {useState} from 'react';
import { firestore } from '../../firebase';

const AdminEditableCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const [name, setName] = useState(course.name);
    const [code, setCode] = useState(course.code);
    const [semester, setSemester] = useState(course.semester);
    const [year, setYear] = useState(course.year);
    const [term, setTerm] = useState(course.term);

    const onSave = () => {
        const update: Partial<FireCourse> = { name, code, semester, year, term };
        firestore.collection('courses').doc(course.courseId).update(update);
    };

    return (
        <div>
            <div className="course-section">
                <h3>Course ID</h3>
                <div>{course.courseId}</div>
            </div>
            <div className="course-section">
                <h3>Course Name</h3>
                <input type="text" value={name} onChange={e => setName(e.currentTarget.value)} />
            </div>
            <div className="course-section">
                <h3>Course Code</h3>
                <input type="text" value={code} onChange={e => setCode(e.currentTarget.value)} />
            </div>
            <div className="course-section">
                <h3>Semester</h3>
                <input type="text" value={semester} onChange={e => setSemester(e.currentTarget.value)} />
            </div>
            <div className="course-section">
                <h3>Year</h3>
                <input type="text" value={year} onChange={e => setYear(e.currentTarget.value)} />
            </div>
            <div className="course-section">
                <h3>Term</h3>
                <input type="text" value={term} onChange={e => setTerm(e.currentTarget.value)} />
            </div>
            <button type="button" onClick={onSave}>Save</button>
        </div>
    );
};

export default AdminEditableCourseCard;