import * as React from 'react';
import { useHistory } from 'react-router';
import { useMyCourses } from '../../firehooks';

import { CURRENT_SEMESTER } from '../../constants';

import Toggle from '../../media/Toggle.svg';

type Props = {
    readonly currentCourseCode: string;
    readonly role?: FireCourseRole;
    // readonly avatar?: string;
};

const CalendarHeader = ({ currentCourseCode, role }: Props): React.ReactElement => {
    const [showCourses, setShowCourses] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const courses = useMyCourses();
    const history = useHistory();

    const handleClick = (e: globalThis.MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setShowCourses(false);
        }
    };

    const courseClicked = (course: FireCourse) => {
        history.push('/course/' + course.courseId);
        window.localStorage.setItem('lastid', String(course.courseId));
    };

    const editClicked = () => {
        history.push('/edit');
    };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    });

    return (
        <div className="Header">
            <div className="CalendarHeader" onClick={() => setShowCourses(!showCourses)} ref={ref}>
                <span>
                    <div className="courseCode">{currentCourseCode}</div>
                    {role && role === 'ta' && <span className="TAMarker">TA</span>}
                    {role && role === 'professor' && <span className="TAMarker Prof">PROF</span>}
                    <img src={Toggle} alt="Course Select" className="Toggle" />
                </span>
                {showCourses && (
                    <ul className="courseMenu" tabIndex={1} onClick={() => setShowCourses(false)}>
                        {courses
                            .filter(c => c.semester === CURRENT_SEMESTER)
                            .map(course => (
                                <li key={course.courseId}>
                                    <div
                                        className={course.code === currentCourseCode ? 'thisCourse' : ''}
                                        onClick={() => courseClicked(course)}
                                    >
                                        {course.code} {course.code === currentCourseCode && <>&#10003;</>}
                                    </div>
                                </li>
                            ))}
                        {role && (
                            <li>
                                <div className="editClasses" onClick={() => editClicked()}>
                                    Edit Classes
                                </div>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

CalendarHeader.defaultProps = {
    role: undefined,
    // avatar: undefined
}

export default CalendarHeader;