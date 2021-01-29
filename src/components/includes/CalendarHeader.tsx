import * as React from 'react';
import { useHistory } from 'react-router'
import { Icon } from 'semantic-ui-react';

import { logOut } from '../../firebasefunctions';
import { useMyCourses } from '../../firehooks';

import { CURRENT_SEMESTER } from '../../constants';

import Toggle from '../../media/Toggle.svg'; 

type Props = {
    readonly currentCourseCode: string;
    readonly role?: FireCourseRole;
    readonly avatar?: string;
};


export default ({ currentCourseCode, role}: Props): React.ReactElement => {
    const [showMenu, setShowMenu] = React.useState(false);
    const [showCourses, setShowCourses] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const courses = useMyCourses();
    const history = useHistory()

    const handleClick = (e: globalThis.MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setShowCourses(false);
        }
    }

    const handleCourseClick = (course: FireCourse) => {
        window.localStorage.setItem("lastid", String(course.courseId));
        history.push(`/course/${course.courseId}`);
    };

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
                                <div
                                    className={course.code === currentCourseCode ? "thisCourse":""}
                                    onClick={() => handleCourseClick(course)}
                                > {course.code} {course.code === currentCourseCode && <>&#10003;</>}
                                </div>
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
            {showMenu && (
                <ul className="desktop logoutMenu" onClick={() => setShowMenu(false)} >
                    {/* RYAN_TODO: figure out what's the purpose of this code. */}
                    {/* {this.props.isTa &&
                            <React.Fragment>
                                <li>Cancel Session</li>
                                <li>Change Session</li>
                            </React.Fragment>
                        } */}
                    <li onClick={() => logOut()}> <span><Icon name="sign out" /></span>Log Out</li>
                    <li onMouseDown={() => window.open('https://goo.gl/forms/7ozmsHfXYWNs8Y2i1', '_blank')}>
                        <span><Icon name="edit" /></span>
                        Send Feedback
                    </li>
                </ul>
            )}
        </div>
    );
};
