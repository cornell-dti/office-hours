import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';
import { logOut } from '../../firebasefunctions';
import Logo from '../../media/Logo.svg';
import CalendarHeader from './CalendarHeader';

const TopBar = (props: {
    courseId: string;
    user?: FireUser;
    // A user's role: student, ta, or professor
    // We show TA's and Profs extra links
    role: FireCourseRole;
    // Whether we're in a "professor" view or "student" view
    // controls where "switch view" goes
    context: string;
    course?: FireCourse;
}) => {
    const history = useHistory();

    const [showMenu, setShowMenu] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');

    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    useEffect(() => setImage(userPhotoUrl), [userPhotoUrl]);

    return (
        <div className="MenuBox" tabIndex={1} onBlur={() => setShowMenu(false)}>
            <header className="topBar">
                <div className="triggerArea">
                    <img src={Logo} className="QMILogo" alt="Queue Me In Logo" />
                    <CalendarHeader
                        currentCourseCode={(props.course && props.course.code) || ''}
                        role={(props.user && props.course && (props.user.roles[props.course.courseId] || 'student'))}
                        avatar={props.user && props.user.photoUrl}
                    />
                    <div className="userProfile" onClick={() => setShowMenu(!showMenu)}>
                        <img 
                            src={image} 
                            className="profilePic" 
                            onError={() => setImage('/placeholder.png')} 
                            alt="User Profile" 
                        />
                        <span className="name">
                            {props.user ? props.user.firstName + ' ' + props.user.lastName : 'Loading...'}
                        </span>
                    </div>
                </div>
            </header>
            {showMenu && <>
                <ul className="desktop logoutMenu" tabIndex={1}>
                    <li onMouseDown={() => logOut()}>
                        <span><Icon name="sign out" /></span> Log Out
                    </li>
                    <li onMouseDown={() => window.open('https://goo.gl/forms/7ozmsHfXYWNs8Y2i1', '_blank')}>
                        <span><Icon name="edit" /></span>
                        Send Feedback
                    </li>
                    {props.role === 'professor' &&
                        <>
                            {props.context === 'professor' ?
                                <li onMouseDown={() => history.push('/course/' + props.courseId)}>
                                    <span><Icon name="sync alternate" /></span>
                                    Switch View
                                </li> : <li onMouseDown={() => history.push('/professor/course/' + props.courseId)}>
                                    <span><Icon name="sync alternate" /></span>
                                    Switch View
                                </li>
                            }
                        </>
                    }
                </ul>
            </>}
        </div>
    );
};

export default TopBar;
