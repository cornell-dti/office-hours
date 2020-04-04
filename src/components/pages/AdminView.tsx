import React, { useState } from 'react';
import * as firebase from 'firebase/app';

import { useAllCourses, useCourseProfessorMap, useCourseTAMap } from '../../firehooks';
import { firestore } from '../../firebase';
import { importProfessorsOrTAsFromPrompt } from '../../firebasefunctions';

const AdminReadOnlyCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const professorMap = useCourseProfessorMap(course);
    const taMap = useCourseTAMap(course);

    return (
        <div>
            <div className="course-section">
                <h3>Course ID</h3>
                <div>{course.courseId}</div>
            </div>
            <div className="course-section">
                <h3>Course Name</h3>
                <div>{course.name}</div>
            </div>
            <div className="course-section">
                <h3>Course Code</h3>
                <div>{course.code}</div>
            </div>
            <div className="course-section">
                <h3>Semester</h3>
                <div>{course.semester}</div>
            </div>
            <div className="course-section">
                <h3>Year</h3>
                <div>{course.year}</div>
            </div>
            <div className="course-section">
                <h3>Term</h3>
                <div>{course.term}</div>
            </div>
            <div className="course-section">
                <h3>Queue Open Interval</h3>
                <div>{course.queueOpenInterval}</div>
            </div>
            <div className="course-section">
                <h3>Char Limit</h3>
                <div>{course.charLimit}</div>
            </div>
            <div className="course-section">
                <h3>Start Date</h3>
                <div>{course.startDate.toDate().toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>End Date</h3>
                <div>{course.endDate.toDate().toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>Professors</h3>
                <div>
                    {course.professors.map(id => {
                        const professor = professorMap[id];
                        if (professor == null) {
                            return null;
                        }
                        return (
                            <div key={id}>
                                <h4>{professor.firstName} {professor.lastName}</h4>
                                <div>{professor.email}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="course-section">
                <h3>TAs</h3>
                <div>
                    {course.tas.map(id => {
                        const ta = taMap[id];
                        if (ta == null) {
                            return null;
                        }
                        return (
                            <div key={id}>
                                <h4>{ta.firstName} {ta.lastName}</h4>
                                <div>{ta.email}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

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
            <button onClick={onSave}>Save</button>
        </div>
    );
};

const AdminCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const [isEditingMode, setIsEditingMode] = useState(false);
    return (
        <div className="course">
            {!isEditingMode && <AdminReadOnlyCourseCard course={course} />}
            {isEditingMode && <AdminEditableCourseCard course={course} />}
            <div>
                <button onClick={() => setIsEditingMode(prev => !prev)}>
                    To {isEditingMode ? 'Read Only' : 'Editing'} Mode
                </button>
                <button onClick={() => importProfessorsOrTAsFromPrompt(firestore, course, 'professor')}>
                    Import Professors
                </button>
                <button onClick={() => importProfessorsOrTAsFromPrompt(firestore, course, 'ta')}>
                    Import TAs
                </button>
            </div>
        </div>
    );
};

const startDate = new Date('2020-03-30');
const endDate = new Date('2020-06-30');

const AdminCourseCreator = ({ onSubmit }: { readonly onSubmit: () => void }) => {
    const [courseId, setCourseId] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [semester, setSemester] = useState('');
    const [year, setYear] = useState('');
    const [term, setTerm] = useState('');

    const disabled = courseId.trim().length === 0
        || name.trim().length === 0
        || code.trim().length === 0
        || semester.trim().length === 0
        || year.trim().length === 0
        || term.trim().length === 0;

    const onSave = () => {
        const course: Omit<FireCourse, 'courseId'> = {
            name,
            code,
            semester,
            year,
            term,
            queueOpenInterval: 30,
            charLimit: 140,
            startDate: firebase.firestore.Timestamp.fromDate(startDate),
            endDate: firebase.firestore.Timestamp.fromDate(endDate),
            professors: [],
            tas: []
        };
        firestore.collection('courses').doc(courseId).set(course).then(onSubmit);
    };

    return (
        <div className="course">
            <h2>Create New Course</h2>
            <div className="course-section">
                <h3>Course Name</h3>
                <input type="text" value={courseId} onChange={e => setCourseId(e.currentTarget.value)} />
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
            <div className="course-section">
                <h3>Start Date</h3>
                <div>{startDate.toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>End Date</h3>
                <div>{endDate.toLocaleDateString()}</div>
            </div>
            <button disabled={disabled} onClick={onSave}>Save</button>
        </div>
    );
};

const AdminView = () => {
    const courses = useAllCourses();
    const [inCreationMode, setInCreationMode] = useState(false);

    return (
        <div className="AdminView">
            <h2>Courses</h2>
            <div className="course-container">
                {courses.map(course => (
                    <AdminCourseCard key={course.courseId} course={course} />
                ))}
                {inCreationMode && <AdminCourseCreator onSubmit={() => setInCreationMode(false)} />}
            </div>
            {!inCreationMode && <button onClick={() => setInCreationMode(true)}>Create New Course</button>}
        </div>
    );
};

export default AdminView;
