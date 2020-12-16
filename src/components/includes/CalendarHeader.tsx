import * as React from 'react';
import { Icon } from 'semantic-ui-react';

import OutsideClickHandler from 'react-outside-click-handler';

import { logOut } from '../../firebasefunctions';
import { useMyCurrentCourses } from '../../firehooks';
import { onEnterOrSpace, useEscape } from '../../utilities/a11y';

import AccessibleButton from './AccessibleButton';
import DropDownEntry from './DropDownEntry';

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
    const courses = useMyCurrentCourses();

    const toClose = React.useCallback(() => {
        if (showCourses) {
            setShowCourses(false);
        }

        if (showMenu) {
            setShowMenu(false); 
        }
    }, [showCourses, showMenu]);

    useEscape(toClose);

    return (
        <div className="Header">
            <div className="LogoContainer">
                <img src={QMeLogo} className="QMeLogo" alt="Queue Me In Logo" />
            </div>
            <OutsideClickHandler display="contents" onOutsideClick={() => setShowCourses(false)}>
                <div
                    role="button"
                    tabIndex={0}
                    aria-haspopup="true"
                    aria-expanded={showCourses}
                    className="CalendarHeader"
                    onKeyPress={onEnterOrSpace(() => setShowCourses(shown =>!shown))}
                    onClick={() => 
                        setShowCourses(shown =>!shown)
                    }
                >
                    <span>
                        <span>{currentCourseCode}</span>
                        {role === 'ta' && <span className="TAMarker">TA</span>}
                        {role === 'professor' && <span className="TAMarker Professor">PROF</span>}
                        <span className="CourseSelect">
                            <img src={chevron} alt="Course Select" className="RotateDown" />
                        </span>
                    </span>
                    {avatar &&
                    <AccessibleButton
                        className="mobileHeaderFace"
                        onInteract={() => {
                            setShowMenu(shown => !shown);
                        }}
                    >
                        <img
                            src={avatar}
                            alt="User avatar"
                        />
                    </AccessibleButton>
                    }
                    {showCourses &&
                     <ul className="courseMenu">
                         {courses?.map((course) =>
                             <li 
                                 key={course.courseId}
                             >
                                 <a
                                     role="button" 
                                     tabIndex={0}
                                     href={'/course/' + course.courseId}
                                 > {course.code}
                                 </a>
                             </li>
                         ) ?? <></>}
                         {role && (
                             <li>
                                 <a
                                     role="button" 
                                     tabIndex={0}
                                     className="editClasses"
                                     href={'/edit'}
                                 >
                                    Edit Classes
                                 </a>
                             </li>
                         )}
                     </ul>
                
                    }
                </div>
            </OutsideClickHandler>
            {showMenu && (
                <OutsideClickHandler onOutsideClick={() => setShowMenu(false)}>
                    <ul className="desktop logoutMenu" >
                        <DropDownEntry onSelect={() => logOut()}>
                            <span><Icon name="sign out" /></span>
                            Log Out
                        </DropDownEntry>
                        <DropDownEntry onSelect={() => window.open('https://goo.gl/forms/7ozmsHfXYWNs8Y2i1', '_blank')}>
                            <span><Icon name="edit" /></span>
                            Send Feedback
                        </DropDownEntry>
                    </ul>
                </OutsideClickHandler>  
            )}
        </div>
    );
};
