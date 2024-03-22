import React, { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { useCourseProfessorMap, useCourseTAMap } from '../../firehooks';



const AdminReadOnlyCourseCard = ({ course }: { readonly course: FireCourse }) => {
    const professorMap = useCourseProfessorMap(course);
    const taMap = useCourseTAMap(course);
    const [profCollapsed, setProfCollapsed] = useState(true);
    const [taCollapsed, setTaCollapsed] = useState(true);
    const profDefaultSize = 2;
    const taDefaultSize = 4;

    /* creates a list for the current professors and tas, displays at most the default size 
    e.g 2 professors and 4 TAs. 
        - [list] is an array of professors or tas, 
        - [roleType] should be either "p" or "t", which indicates whether this 
        function is for displaying professors or TAs
        - [defaultSize] is the number of professors or TAs to show by default before the icons appear
    */
    const displayRoleList = (list: readonly string[], roleType: string, defaultSize: number) => {

        if (list.length <= defaultSize) {
            return (
                <ul>
                    {list.map(id => {
                        const role = roleType === "p" ? professorMap[id] : taMap[id];

                        if (role === null || role === undefined) {
                            return null;
                        }

                        return (
                            <li key={id}>
                                {role.firstName}  {role.lastName} ({role.email})
                            </li>
                        );
                    })}
                </ul>
            )
        }
        return (
            <ul>
                {list.slice(0, defaultSize).map(id => {
                    const role = roleType === "p" ? professorMap[id] : taMap[id];
                    if (role === null || role === undefined) {
                        return null;
                    }
                    return (
                        <li key={id}>
                            {role.firstName}  {role.lastName} ({role.email})
                        </li>
                    );
                })}
            </ul>
        )
    }

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
                {course.professors.length === 0 && <div>None</div>}
                {displayRoleList(course.professors, "p", profDefaultSize)}

                <br />

                {/* Display icon only if the number of professors is greater than the default size */}
                {course.professors.length > profDefaultSize ?
                    profCollapsed ?
                        (<Icon name='chevron down' onClick={() => { setProfCollapsed(false) }} />) :
                        (<Icon name='chevron up' onClick={() => setProfCollapsed(true)} />) :
                    null
                }
                <ul>
                    {(!profCollapsed && course.professors.length > profDefaultSize)
                        && course.professors.slice(profDefaultSize, course.professors.length).map(id => {
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
                {course.tas.length === 0 && <div>None</div>}
                {displayRoleList(course.tas, "t", taDefaultSize)}

                <br />
                {/* Display icon only if the number of TAs is greater than the default size */}
                {course.tas.length > taDefaultSize ?
                    taCollapsed ?
                        (<Icon name='chevron down' onClick={() => { setTaCollapsed(false) }} />) :
                        (<Icon name='chevron up' onClick={() => setTaCollapsed(true)} />) :
                    null
                }
                <ul>
                    {(!taCollapsed && course.tas.length > taDefaultSize)
                        && course.tas.slice(taDefaultSize, course.tas.length).map(id => {
                            const ta = taMap[id];
                            if (ta === null || ta === undefined) {
                                return null;
                            }
                            return (
                                <li key={id}>
                                    {ta.firstName}  {ta.lastName} ({ta.email})
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
};

export default AdminReadOnlyCourseCard;