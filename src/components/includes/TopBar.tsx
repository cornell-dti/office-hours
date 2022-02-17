import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { logOut } from '../../firebasefunctions/user';
import Logo from '../../media/QLogo2.svg';
import CalendarHeader from './CalendarHeader';
import ProfessorStudentToggle from './ProfessorStudentToggle';
import TopBarNotifications from './TopBarNotifications'
import {useNotificationTracker, useMyUser} from '../../firehooks';
import { Modal, Button, Checkbox, Message, Confirm } from 'semantic-ui-react';
import { 
    TextField, 
    Switch, 
    FormControlLabel, 
    Stepper, 
    Step, 
    StepLabel, 
    StepContent, 
    createTheme,
    ThemeProvider,
    Typography
} from "@material-ui/core/";
import { updatePhoneData } from '../../firebasefunctions/phoneNumber';

enum Validation {
    NOT_REQUESTED,
    SUCCESS,
    FAILURE,
}

const theme = createTheme({
    overrides: {
     MuiStepIcon: {
      root: {
        '&$completed': {
          color: 'black',
        },
        '&$active': {
          color: 'black',
        },
      },
      active: {},
      completed: {},
    },
    MuiSwitch: {
        colorSecondary: {
            "&$checked": {
              color: "blue"
            }
        },
    }
  }
})

const validatePhone = (phNumber : string) => {
    return phNumber.length == 10 && /[1-9]{1}[0-9]{9}/.test(phNumber);
}

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
    admin?: boolean;
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [phoneNum, setPhoneNum] = useState(props.user?.phoneNumber || "");
    const [phoneConsent, setPhoneConsent] = useState(props.user?.textNotifsEnabled || false);
    const [checkConsent, setCheckConsent] = useState(props.user?.textNotifsEnabled || false);
    const [validation, setValidation] = useState(Validation.NOT_REQUESTED);
    const [activeStep, setActiveStep] = useState(phoneConsent ? 2 : 0);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');
    const ref = React.useRef<HTMLDivElement>(null);

    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    useEffect(() => setImage(userPhotoUrl), [userPhotoUrl]);

    const user = useMyUser();
    const email: string | undefined = user?.email
    const notificationTracker = useNotificationTracker(email);

    const handleClick = (e: globalThis.MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setShowMenu(false);
        }
    };

    React.useEffect(() => {
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
                        <TopBarNotifications notificationTracker={notificationTracker} user={user} />
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
                onClose = {() => setPhoneModalVisible(false)}
                open = {phoneModalVisible}
            >
                <Modal.Header style = {{ FontFace: 'Roboto' }}>Text Message Notifications</Modal.Header>
                <div style = {{ paddingLeft: '1em', paddingTop: '1em', display: 'flex', flexDirection: 'row' }}>
                    { user?.textNotifsEnabled ? 
                        <h3>Update SMS Notifications</h3> : <h3>Enable SMS Notifications</h3>
                    }
                    <FormControlLabel 
                        style = {{ marginLeft: 'auto' }}
                        control={
                            <Switch 
                                defaultChecked = {phoneConsent}
                                color = "primary"
                                onChange = {() => {
                                        setPhoneConsent(!phoneConsent)

                                        updatePhoneData(user?.userId, {
                                            textNotifsEnabled: !phoneConsent
                                        })

                                        if (phoneConsent) {
                                            setCheckConsent(false)
                                            setActiveStep(0)
                                        }
                                    }
                                } 
                            />
                        } 
                        label={`Text Notifs: ${phoneConsent ? "on" : "off"}`} 
                    />
                </div>
                <ThemeProvider theme = {theme}>
                <Stepper activeStep={activeStep} orientation='vertical'>
                    <Step>
                        <StepLabel>Acknowledgement and Consent</StepLabel>
                        <StepContent>
                            <div style = {{ display: 'flex', flexDirection: 'column', padding: '1em'}}>
                                <h4>
                                    By checking this box you consent to receiving SMS messages from Queue Me In. 
                                    We do not give your number to third party clients.
                                </h4>
                                <Checkbox
                                    checked = {checkConsent}
                                    disabled = {!phoneConsent}
                                    onChange = {
                                        () => {
                                            setCheckConsent(!checkConsent)
                                            setActiveStep(1)
                                        }
                                    }
                                />
                            </div>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Enter Phone Number</StepLabel>
                        <StepContent>
                            <div style = {{ display: 'flex', flexDirection: 'column', padding: '1em' }}>
                                <TextField 
                                    variant = "outlined" 
                                    label = 'Phone Number (ex. 1231231234)' 
                                    value = {phoneNum}
                                    onChange = {(event) => {
                                            if (event.target.value === "" || /^[0-9\b]+$/.test(event.target.value))
                                                setPhoneNum(event.target.value)
                                        }
                                    }
                                    onKeyPress = {
                                        (event) => {
                                            if (event.key === 'Enter')
                                                setActiveStep(2)
                                        }
                                    }
                                    disabled = {!phoneConsent}
                                />
                            </div>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Confirm and Finish</StepLabel>
                        <StepContent>
                            <div style = {{ display: 'flex', flexDirection: 'column', padding: '1em' }}>
                                <Typography>
                                    By clicking on the button below you consent to receiving text notifs
                                    at {phoneNum} when your turn is coming for all your classes and OHs.

                                    You can edit phone notifs at any time by clicking on your Profile &gt; SMS settings.
                                </Typography>
                                <div style = {{ display: 'flex', flexDirection: 'row', marginTop: '1em' }}>
                                    <Button
                                        className = 'ui button'
                                        onClick={() => setActiveStep(1)}
                                        style = {{display: 'flex'}}
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        className = 'ui button'
                                        type = 'submit'
                                        onClick = {
                                            () => {
                                                if (validatePhone(phoneNum) && phoneConsent) {
                                                    updatePhoneData(user?.userId, {
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
                                        style = {{display: 'flex'}}
                                    >
                                        Save All Changes
                                    </Button>
                                    <Confirm 
                                        open = {validation === Validation.SUCCESS}
                                        onCancel = {() => setValidation(Validation.NOT_REQUESTED)}
                                        onClose = {() => setValidation(Validation.NOT_REQUESTED)}
                                        onConfirm = {() => setValidation(Validation.NOT_REQUESTED)}
                                        header = 'Update successful'
                                        content = 'SMS Settings Updated Successfully'
                                    />
                                    <Confirm 
                                        open = {validation === Validation.FAILURE}
                                        onCancel = {() => setValidation(Validation.NOT_REQUESTED)}
                                        onClose = {() => setValidation(Validation.NOT_REQUESTED)}
                                        onConfirm = {() => setValidation(Validation.NOT_REQUESTED)}
                                        header = 'Failed to update'
                                        content = "You didn't consent to receiving notifs or you entered an invalid phone number!"
                                    />
                                </div>
                            </div>
                        </StepContent>
                    </Step>
                </Stepper>
                </ThemeProvider>
            </Modal>
        </div>
    );
};

TopBar.defaultProps = {
    user: undefined,
    course: undefined,
    admin: false,
};

export default TopBar;