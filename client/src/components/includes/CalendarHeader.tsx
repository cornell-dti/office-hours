import React, { useState } from 'react';
import { Icon } from 'semantic-ui-react';
// const QMeLogo = require('../../media/QMeLogo.svg');
import QMeLogo from '../../media/QLogo2.svg';
import chevron from '../../media/chevron.svg'; // Replace with dropdown cheveron

const CalendarHeader = (props: {
    currentCourseCode: string;
    isTa: boolean;
    isProf: boolean;
    avatar: string | null;
    allCoursesList: FireCourse[];
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showCourses, setShowCourses] = useState(false);

    return (
        <div className="Header">
            <div className="LogoContainer">
                <img src={QMeLogo} className="QMeLogo" alt="Queue Me In" />
            </div>
            <div className="CalendarHeader" onClick={() => setShowCourses(!showCourses)}>
                <span>
                    <span>{props.currentCourseCode}</span>
                    {props.isTa && <span className="TAMarker">TA</span>}
                    {props.isProf && <span className="TAMarker Professor">PROF</span>}
                    <span className="CourseSelect">
                        <img src={chevron} alt="Course Select" className="RotateDown" />
                    </span>
                </span>
                {props.avatar
                    && <img
                        className="mobileHeaderFace"
                        alt="User Avatar"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        src={props.avatar}
                    />
                }
                {showCourses
                    && (
                        <ul className="courseMenu" tabIndex={1} onClick={() => setShowCourses(false)}>
                            {props.allCoursesList.filter((c) => c.semester === 'SP19').map((course) => (
                                <li key={course.id}>
                                    <a
                                        href={`/course/${course.id}`}
                                        onClick={() => window.localStorage.setItem('lastid', course.id)}
                                    >
                                        {course.code}
                                    </a>
                                </li>))}
                        </ul>
                    )}
            </div>
            {showMenu && (
                <ul className="logoutMenu" onClick={() => setShowMenu(false)}>
                    {/* {props.isTa &&
                            <React.Fragment>
                                <li>Cancel Session</li>
                                <li>Change Session</li>
                            </React.Fragment>
                        } */}
                    <li>
                        <a href="/__auth/logout">
                            <span>
                                <Icon name="sign out" />
                            </span>
                            Log Out
                        </a>
                    </li>
                    <li>
                        <a href="https://goo.gl/forms/7ozmsHfXYWNs8Y2i1" target="_blank" rel="noopener noreferrer">
                            <span>
                                <Icon name="edit" />
                            </span>
                            Send Feedback
                        </a>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default CalendarHeader;
