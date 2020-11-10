import React, { useState } from 'react';

import { createCourse, editCourse } from 'lib/admin/course';
import moment from 'moment';
import { useAllCourses, useCourseProfessorMap, useCourseTAMap } from '../../firehooks';
import ProfessorRolesTable from '../includes/ProfessorRolesTable';
import { CURRENT_SEMESTER } from '../../constants';

const AdminReadOnlyCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const professorMap = useCourseProfessorMap(course);
    const taMap = useCourseTAMap(course);

    return (
        <div>
            <div className="course-section">
                <h3>{course.courseId} ({course.code}: {course.name})</h3>
                <div>Semester: {course.semester}, year: {course.year}, term: {course.term}</div>
            </div>
            <div className="course-section">
                <h3>Settings: </h3>
                <div>Queue Open Interval{course.queueOpenInterval}</div>
                <div>Char Limit: {course.charLimit}</div>
                <div>Start Date: {course.startDate.toDate().toLocaleDateString()}</div>
                <div>End Date: {course.endDate.toDate().toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>Professors</h3>
                {course.professors.length === 0 && <div>None</div>}
                <ul>
                    {course.professors.map(id => {
                        const professor = professorMap[id];
                        if (professor == null) {
                            return null;
                        }
                        return (
                            <li key={id}>
                                {professor.firstName} {professor.lastName} ({professor.email})
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="course-section">
                <h3>TAs</h3>
                {course.tas.length === 0 && <div>None</div>}
                <ul>
                    {course.tas.map(id => {
                        const ta = taMap[id];
                        if (ta == null) {
                            return null;
                        }
                        return (
                            <li key={id}>
                                {ta.firstName} {ta.lastName} ({ta.email})
                            </li>
                        );
                    })}
                </ul>
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

        editCourse(course.courseId, update);
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

const AdminCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [showRolesTable, setShowRolesTable] = useState(false);
    return (
        <div className="course">
            {!isEditingMode && <AdminReadOnlyCourseCard course={course} />}
            {isEditingMode && <AdminEditableCourseCard course={course} />}
            <div>
                <button type="button" onClick={() => setIsEditingMode(prev => !prev)}>
                    To {isEditingMode ? 'Read Only' : 'Editing'} Mode
                </button>
                <button type="button" onClick={() => setShowRolesTable(prev => !prev)}>
                    {showRolesTable ? 'Hide' : 'Show'} Roles Table
                </button>
            </div>
            {showRolesTable && <ProfessorRolesTable courseId={course.courseId} />}
        </div>
    );
};

const startDate = moment(new Date('2020-09-02'));
const endDate = moment(new Date('2020-12-21'));
const currentTerm = CURRENT_SEMESTER.substring(0, 2);
const currentYear = CURRENT_SEMESTER.substring(2, 4);

const AdminCourseCreator = ({ onSubmit }: { readonly onSubmit: () => void }) => {
    const [courseId, setCourseId] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [semester, setSemester] = useState(CURRENT_SEMESTER);
    const [year, setYear] = useState(currentTerm);
    const [term, setTerm] = useState(currentYear);

    const disabled = courseId.trim().length === 0
        || name.trim().length === 0
        || code.trim().length === 0
        || semester.trim().length === 0
        || year.trim().length === 0
        || term.trim().length === 0;

    const onSave = () => {
        createCourse(courseId, {
            name,
            code,
            semester,
            year,
            term,
            queueOpenInterval: 30,
            charLimit: 140,
            startDate,
            endDate
        }).then(() => {
            onSubmit();
        });
    };

    return (
        <div className="course">
            <h2>Create New Course</h2>
            <div className="course-section">
                <h3>Course Id</h3>
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
                <div>{startDate.toDate().toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>End Date</h3>
                <div>{endDate.toDate().toLocaleDateString()}</div>
            </div>
            <button type="button" disabled={disabled} onClick={onSave}>Save</button>
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
                {courses.filter(course => course.semester === CURRENT_SEMESTER).map(course => (
                    <AdminCourseCard key={course.courseId} course={course} />
                ))}
                {inCreationMode && <AdminCourseCreator onSubmit={() => setInCreationMode(false)} />}
            </div>

            {!inCreationMode &&
                <button type="button" onClick={() => setInCreationMode(true)}>Create New Course</button>}

            <h2>Archived Courses</h2>
            <div className="course-container">
                {courses.filter(course => course.semester !== CURRENT_SEMESTER).map(course => (
                    <AdminCourseCard key={course.courseId} course={course} />
                ))}
            </div>
            {!inCreationMode &&
                <button type="button" onClick={() => setInCreationMode(true)}>Create New Course</button>}
        </div>
    );
};

export default AdminView;
