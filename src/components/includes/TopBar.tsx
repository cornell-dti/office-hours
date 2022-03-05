import React, { useEffect, useState } from 'react';
import { Icon , Modal, Input, Button, Checkbox, Message, Confirm } from 'semantic-ui-react';
import {connect} from 'react-redux'
import addNotification from 'react-push-notification';
import { logOut } from '../../firebasefunctions/user';
import Logo from '../../media/QLogo2.svg';
import CalendarHeader from './CalendarHeader';
import ProfessorStudentToggle from './ProfessorStudentToggle';
import TopBarNotifications from './TopBarNotifications'
import {useNotificationTracker} from '../../firehooks';
import { updatePhoneNum } from '../../firebasefunctions/phoneNumber';
import { RootState } from '../../redux/store';
import { updateLastSent } from '../../firebasefunctions/notifications';

enum Validation {
    NOT_REQUESTED,
    SUCCESS,
    FAILURE,
}

const validatePhone = (phNumber: string) => {
    return phNumber.length === 10 && /[1-9]{1}[0-9]{9}/.test(phNumber);
}

type Props = {
    courseId: string;
    user: FireUser | undefined;
    // A user's role: student, ta, or professor
    // We show TA's and Profs extra links
    role: FireCourseRole;
    // Whether we're in a "professor" view or "student" view
    // controls where "switch view" goes
    context: string;
    course?: FireCourse;
    admin?: boolean;
}

const TopBar = (props: Props) => {
    const [showMenu, setShowMenu] = useState(false);
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [phoneNum, setPhoneNum] = useState(props.user?.phoneNumber || "");
    const [phoneConsent, setPhoneConsent] = useState(props.user?.textNotifsEnabled || false);
    const [validation, setValidation] = useState(Validation.NOT_REQUESTED);
    const [disableModalVisible, setDisableModalVisible] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');
    const ref = React.useRef<HTMLDivElement>(null);

    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    useEffect(() => setImage(userPhotoUrl), [userPhotoUrl]);

    const user = props.user;
    const email: string | undefined = user?.email
    const notificationTracker = useNotificationTracker(email);

    useEffect(() => {
        if(notificationTracker!== undefined) {
            for(let i = 0; i < notificationTracker.notificationList.length; i++) {
                const notif = notificationTracker.notificationList[i];
                // checks that the notification was created after the last time notifications were sent
                // adds 1000 to lastSent time because client and server TimeStamps seems to be slightly
                // misaligned
                if(notificationTracker.lastSent === undefined || 
                    notif.createdAt.toDate().getTime() > 
                    notificationTracker?.lastSent.toDate().getTime()+ 1000) {
                    updateLastSent(user, notificationTracker);
                    addNotification({
                        title: notif.title,
                        subtitle: notif.subtitle,
                        message: notif.message,
                        native: true
                    });
                    // hacky fix for duplicate notifs--server update to lastSent doesn't occur quickly enough
                    setTimeout(() => {}, 100);
                } else {
                    break;
                }
            }
        }
    }, [notificationTracker, user])

    const handleClick = (e: globalThis.MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setShowMenu(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    });

    return (
        <div className="MenuBox" onBlur={() => setShowMenu(false)} ref={ref}>
            <header className="topBar">
                <div className="triggerArea">
                    <img src={Logo} className="QMILogo" alt="Queue Me In Logo" />
                    <div className="viewToggles">
                        <CalendarHeader
                            currentCourseCode={(props.course && props.course.code) || 'Courses'}
                            role={
                                props.user &&
                                props.course &&
                                (props.user.roles[props.course.courseId] || 'student' || props.admin)
                            }
                        />
                        {props.role === 'professor' && (
                            <ProfessorStudentToggle courseId={props.courseId} context={props.context} />
                        )}
                    </div>
                    <div className="rightContentWrapper" >
                        <TopBarNotifications notificationTracker={notificationTracker} />
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
                </div>
            </header>
            {showMenu && (
                <>
                    <ul className="desktop logoutMenu">
                        <li onMouseDown={() => logOut()}>
                            <span>
                                <Icon name="sign out" />
                            </span>{' '}
                            Log Out
                        </li>
                        <li
                            onMouseDown={() =>
                                window.open('https://goo.gl/forms/7ozmsHfXYWNs8Y2i1', '_blank')
                            }
                        >
                            <span>
                                <Icon name="edit" />
                            </span>
                            Send Feedback
                        </li>
                        <li
                            onMouseDown={() => setPhoneModalVisible(true)}
                        >
                            <span>
                                <Icon name="settings" />
                            </span>
                            SMS Settings
                        </li>
                    </ul>
                </>
            )}
            <Modal
                onClose={() => setPhoneModalVisible(false)}
                open={phoneModalVisible}
            >
                <Modal.Header style={{ FontFace: 'Roboto' }}>Text Message Notifications</Modal.Header>
                <div style={{ paddingLeft: '1em', paddingTop: '1em' }}>
                    { user?.textNotifsEnabled ? 
                        <h3>Update SMS Notifications</h3> : <h3>Enable SMS Notifications</h3>
                    }
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', padding: '1em'}}>
                    <Checkbox
                        checked={phoneConsent}
                        onChange={() => setPhoneConsent(!phoneConsent)}
                        style={{ alignSelf: 'center' }}
                    />
                    <h4 style={{ alignSelf: 'center', marginTop: '.25em', marginLeft: '1em' }}>
                        By checking this box you consent to receiving SMS messages from Queue Me In. 
                        We do not give your number to third party clients.
                    </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '1em' }}>
                    <Input
                        disabled={!phoneConsent}
                        placeholder='Phone Number (ex. 1231231234)' 
                        size='big' 
                        value={phoneNum}
                        onChange={
                            (event, data) =>  {
                                // Only let user enter numbers
                                if (data.value === "" || /^[0-9\b]+$/.test(data.value))
                                    setPhoneNum(data.value)
                            }
                        }
                    />
                    <Button 
                        className='ui button'
                        type='submit'
                        onClick={
                            () => {
                                if (validatePhone(phoneNum) && phoneConsent) {
                                    updatePhoneNum(user?.userId, {
                                        phoneNumber: phoneNum, 
                                        textNotifsEnabled: true
                                    })
                                    setValidation(Validation.SUCCESS)
                                } else {
                                    setPhoneConsent(user?.textNotifsEnabled || false)
                                    setPhoneNum(user?.phoneNumber || "")
                                    setValidation(Validation.FAILURE)
                                }
                            }
                        }
                        style={{ marginTop: '1em' }}
                    >
                        Save All Changes / Enable SMS Notifs
                    </Button>
                    <Confirm 
                        open={validation === Validation.SUCCESS}
                        onCancel={() => setValidation(Validation.NOT_REQUESTED)}
                        onClose={() => setValidation(Validation.NOT_REQUESTED)}
                        onConfirm={() => setValidation(Validation.NOT_REQUESTED)}
                        header='Update successful'
                        content='SMS Settings Updated Successfully'
                    />
                    <Confirm 
                        open={validation === Validation.FAILURE}
                        onCancel={() => setValidation(Validation.NOT_REQUESTED)}
                        onClose={() => setValidation(Validation.NOT_REQUESTED)}
                        onConfirm={() => setValidation(Validation.NOT_REQUESTED)}
                        header='Failed to update'
                        content="You didn't consent to receiving notifs or you entered an invalid phone number!"
                    />
                </div>
                <div style={{ paddingLeft: '1em', paddingTop: '1em' }}>
                    <h3>Disable SMS Notifications</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '1em' }}>
                    <Message negative>
                        <h4>
                            NOTE: Disabling SMS notifs will remove your phone number data.
                            To re-enable SMS notifs, you'll have to re-enter your phone number.
                        </h4>
                    </Message>
                    <Button 
                        className='ui button'
                        type='submit'
                        onClick={
                            () => {
                                updatePhoneNum(user?.userId, {phoneNumber: "", textNotifsEnabled: false})
                                setPhoneNum("")
                                setPhoneConsent(false);
                                setDisableModalVisible(true);
                            }
                        }
                        style={{ backgroundColor: 'red', color: 'white' }}
                    >
                        Disable SMS Notifs
                    </Button>
                    <Confirm 
                        open={disableModalVisible}
                        onCancel={() => setDisableModalVisible(false)}
                        onClose={() => setDisableModalVisible(false)}
                        onConfirm={() => setDisableModalVisible(false)}
                        header='SMS Notifs Disabled'
                        content="You will no longer receive SMS notifs!"
                    />
                </div>
            </Modal>
        </div>
    );
};

TopBar.defaultProps = {
    course: undefined,
    admin: false,
};

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})(TopBar);