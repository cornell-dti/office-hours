import * as React from 'react';
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

export default ({ currentCourseCode, role, avatar }: Props): React.ReactElement => {
    const [showMenu, setShowMenu] = React.useState(false);
    const [showCourses, setShowCourses] = React.useState(false);
    const courses = useMyCourses();

    return (
        <div className="Header">
            <div className="CalendarHeader" onClick={() => setShowCourses(shown => !shown)}>
                <span>
                    <div className="courseCode">{currentCourseCode}</div>
                    {role && role === 'ta' && <span className="TAMarker">TA</span>}
                    <img src={Toggle} alt="Course Select" className="Toggle" />
                </span>
                {avatar &&
                    <img
                        className="mobileHeaderFace"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(shown => !shown);
                        }}
                        src={avatar}
                        alt="User avatar"
                    />
                }
                {showCourses &&
                    <ul className="courseMenu" tabIndex={1} onClick={() => setShowCourses(false)} >
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
