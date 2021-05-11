import * as React from 'react';
import { useMyCourses } from '../../firehooks';

import { CURRENT_SEMESTER } from '../../constants';

import Toggle from '../../media/Toggle.svg'; 

type Props = {
    readonly currentCourseCode: string;
    readonly role?: FireCourseRole;
    readonly avatar?: string;
};


export default ({ currentCourseCode, role}: Props): React.ReactElement => {
    const [showCourses, setShowCourses] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const courses = useMyCourses();

    const handleClick = (e: globalThis.MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setShowCourses(false);
        }
    }

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        }
    })

    return (
        <div className="Header">
            <div className="CalendarHeader" onClick={() => setShowCourses(!showCourses)} ref={ref}>
                <span>
                    <div className="courseCode">{currentCourseCode}</div>
                    {role && role === 'ta' && <span className="TAMarker">TA</span>}
                    {role && role === 'professor' && <span className="TAMarker Prof">PROF</span>}
                    <img src={Toggle} alt="Course Select" className="Toggle" />
                </span>
                {showCourses &&
                    <ul className="courseMenu" tabIndex={1} onClick={() => setShowCourses(false)}>
                        {courses.filter((c) => c.semester === CURRENT_SEMESTER).map((course) =>
                            <li key={course.courseId}>
                                <a
                                    className={course.code === currentCourseCode ? "thisCourse":""}
                                    href={'/course/' + course.courseId}
                                    onClick={() =>
                                        window.localStorage.setItem('lastid', String(course.courseId))}
                                > {course.code} {course.code === currentCourseCode && <>&#10003;</>}
                                </a>
                            </li>
                        )}
                        {role && (
                            <li>
                                <a className="editClasses" href={'/edit'}>
                                    Edit Classes
                                </a>
                            </li>
                        )}
                    </ul>
                }
            </div>
        </div>
    );
};
