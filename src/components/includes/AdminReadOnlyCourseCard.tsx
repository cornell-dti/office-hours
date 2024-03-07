import React, { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { useCourseProfessorMap, useCourseTAMap } from '../../firehooks';



const AdminReadOnlyCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const professorMap = useCourseProfessorMap(course);
    const taMap = useCourseTAMap(course);
    const [profCollapsed, setProfCollapsed] = useState(true);
    const [taCollapsed, setTaCollapsed] = useState(true);

    return (
        <div>
            <div className="course-section">
                <h3>{course.courseId} ({course.code}: {course.name})</h3>
                <div>Semester: {course.semester}, year: {course.year}, term: {course.term}</div>
            </div>
            <div className="course-section">
                <h3>Settings: </h3>
                <div>Queue Open Interval: {course.queueOpenInterval}</div>
                <div>Char Limit: {course.charLimit}</div>
                <div>Start Date: {course.startDate.toDate().toLocaleDateString()}</div>
                <div>End Date: {course.endDate.toDate().toLocaleDateString()}</div>
            </div>
            <div className="course-section">
                <h3>Professors</h3>
                {/* if there are any professors in the list, the collapsible option is displayed */}
                {course.professors.length === 0 ? true :
                    profCollapsed ? (<Icon name='chevron down' onClick={() => { setProfCollapsed(false) }} />) :
                        (<Icon name='chevron up' onClick={() => setProfCollapsed(true)} />)}

                {course.professors.length === 0 && <div>None</div>}

                <ul>
                    {!profCollapsed && course.professors.map(id => {
                        const professor = professorMap[id];
                        if (professor === null || professor === undefined) {
                            return null;
                        }
                        return (
                            <li key={id}>
                                {professor.firstName}  {professor.lastName} ({professor.email})
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="course-section">
                <h3>TAs</h3>
                {/* if there are any TAs in the list, the collapsible option is displayed */}
                {course.tas.length === 0 ? true :
                    taCollapsed ? (<Icon name='chevron down' onClick={() => { setTaCollapsed(false) }} />) :
                        (<Icon name='chevron up' onClick={() => setTaCollapsed(true)} />)}

                {course.tas.length === 0 && <div>None</div>}
                <ul>
                    {!taCollapsed && course.tas.map(id => {
                        const ta = taMap[id];
                        if (ta === null || ta === undefined) {
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

export default AdminReadOnlyCourseCard;