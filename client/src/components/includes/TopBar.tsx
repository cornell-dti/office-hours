import * as React from 'react';
import { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { logOut } from '../../firebasefunctions';

const TopBar = (props: {
    courseId: string,
    user?: FireUser,
    // A user's role: student, ta, or professor
    // We show TA's and Profs extra links
    role: string,
    // Whether we're in a "professor" view or "student" view
    // controls where "switch view" goes
    context: string
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');

    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    useEffect(() => setImage(userPhotoUrl), [userPhotoUrl]);

    const redirect = (href: string) => document.location.href = href;
    return (
        <div className="MenuBox" tabIndex={1}>
            <header className="topBar">
                <div className="triggerArea" onClick={() => setShowMenu(!showMenu)}>
                    <div className="userProfile">
                        <img src={image} onError={() => setImage('/placeholder.png')} alt="User Profile" />
                        <span className="name">
                            {props.user ? props.user.firstName + ' ' + props.user.lastName : 'Loading...'}
                        </span>
                    </div>
                </div>
            </header>
            {showMenu && <React.Fragment>
                <ul className="desktop logoutMenu" tabIndex={1}>
                    <li onClick={() => logOut()}>
                        <span><Icon name="sign out" /></span> Log Out
                            </li>
                    {/* RYAN_TODO logout */}
                    <li onMouseDown={() => window.open('https://goo.gl/forms/7ozmsHfXYWNs8Y2i1', '_blank')}>
                        <span><Icon name="edit" /></span>
                        Send Feedback
                            </li>
                    {props.role === 'professor' &&
                        <React.Fragment>
                            {props.context === 'professor' ?
                                <li onMouseDown={() => redirect('/course/' + props.courseId)}>
                                    <span><Icon name="sync alternate" /></span>
                                    Switch View
                                    </li> : <li onMouseDown={() => redirect('/professor/course/' + props.courseId)}>
                                    <span><Icon name="sync alternate" /></span>
                                    Switch View
                                </li>
                            }
                        </React.Fragment>
                    }
                </ul>
            </React.Fragment>}
        </div>
    );
};

export default TopBar;
