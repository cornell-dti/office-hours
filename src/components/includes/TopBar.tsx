import React, { useEffect, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { useHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';

import { logOut } from '../../firebasefunctions';
import { onEnterOrSpace, useEscape } from '../../utilities/a11y';

import DropDownEntry from './DropDownEntry';

const FEEDBACK_FORM = 'https://goo.gl/forms/7ozmsHfXYWNs8Y2i1';

const TopBar = (props: {
    courseId: string;
    user?: FireUser;
    // A user's role: student, ta, or professor
    // We show TA's and Profs extra links
    role: FireCourseRole;
    // Whether we're in a "professor" view or "student" view
    // controls where "switch view" goes
    context: string;
}) => {
    const history = useHistory();

    const [showMenu, setShowMenu] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');

    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    
    useEffect(() => {
        setImage(userPhotoUrl);
    }, [userPhotoUrl]);

    const toClose = React.useCallback(() => {
        if (showMenu) {
            setShowMenu(false); 
        }
    }, [showMenu]);

    useEscape(toClose);

    return (
        <div className="MenuBox">
            <header className="topBar">
                <OutsideClickHandler display="contents" onOutsideClick={() => setShowMenu(false)}>
                    <div
                        role="button"
                        tabIndex={0}
                        aria-haspopup="true"
                        aria-expanded={showMenu}
                        className="triggerArea userProfile"
                        onKeyPress={onEnterOrSpace(() => setShowMenu(!showMenu))}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <img src={image} onError={() => setImage('/placeholder.png')} alt="User Profile" />
                        <span className="name">
                            {props.user ? props.user.firstName + ' ' + props.user.lastName : 'Loading...'}
                        </span>
                        {showMenu && <>
                       
                            <ul className="desktop logoutMenu">
                                <DropDownEntry onSelect={() => logOut()}>
                                    <span><Icon name="sign out" /></span> Log Out
                                </DropDownEntry>
                                <DropDownEntry onSelect={() => window.open(FEEDBACK_FORM, '_blank')}>
                                    <span><Icon name="edit" /></span>
                                    Send Feedback
                                </DropDownEntry>
               
                                {props.role === 'professor' &&
                        <>
                            {props.context === 'professor' ?
                                <DropDownEntry onSelect={() => history.push('/course/' + props.courseId)}>
                                    <span><Icon name="sync alternate" /></span>
                                    Switch View
                                </DropDownEntry> : 
                                <DropDownEntry onSelect={() => history.push('/professor/course/' + props.courseId)}>
                                    <span><Icon name="sync alternate" /></span>
                                    Switch View
                                </DropDownEntry>
                            }
                        </>
                                }
                            </ul>
                      
                        </>}
                    </div>
                </OutsideClickHandler>
            </header>
        </div>
    );
};

export default TopBar;
