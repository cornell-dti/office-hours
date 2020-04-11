import * as React from 'react';
import { Icon } from 'semantic-ui-react';

import { logOut } from '../../firebasefunctions';
import { useMyCourses } from '../../firehooks';

import { CURRENT_SEMESTER } from '../../constants';

import QMeLogo from '../../media/QLogo2.svg';
import chevron from '../../media/chevron.svg'; // Replace with dropdown cheveron

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
            <div className="LogoContainer">
                <img src={QMeLogo} className="QMeLogo" alt="Queue Me In Logo" />
            </div>
            <div className="CalendarHeader" onClick={() => setShowCourses(shown => !shown)}>
                <span>
                    <span>{currentCourseCode}</span>
                    {role && role === 'ta' && <span className="TAMarker">TA</span>}
                    {role && role === 'professor' && <span className="TAMarker Professor">PROF</span>}
                    <span className="CourseSelect">
                        <img src={chevron} alt="Course Select" className="RotateDown" />
                    </span>
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
                                    href={'/course/' + course.courseId}
                                    onClick={() =>
                                        window.localStorage.setItem('lastid', String(course.courseId))}
                                > {course.code}
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
