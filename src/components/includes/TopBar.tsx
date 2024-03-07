import React, { useEffect, useState } from "react";

import { useHistory } from "react-router";

import { connect } from "react-redux";
import addNotification from "react-push-notification";
import { Icon } from "semantic-ui-react";
import { logOut } from "../../firebasefunctions/user";
import Logo from "../../media/QLogo2.svg";
import CalendarHeader from "./CalendarHeader";
import ProfessorStudentToggle from "./ProfessorStudentToggle";
import TopBarNotifications from "./TopBarNotifications";
import { useNotificationTracker } from "../../firehooks";
import { RootState } from "../../redux/store";
import { updateLastSent } from "../../firebasefunctions/notifications";
import Snackbar from "./Snackbar";
import TextNotificationModal from "./TextNotificationModal";

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
    snackbars: Announcement[];
};

const TopBar = (props: Props) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showTextModal, setShowTextModal] = useState<boolean>(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : "/placeholder.png");
    const ref = React.useRef<HTMLDivElement>(null);
    const history = useHistory();

    const userPhotoUrl = props.user ? props.user.photoUrl : "/placeholder.png";
    useEffect(() => setImage(userPhotoUrl), [userPhotoUrl]);

    const user = props.user;
    const email: string | undefined = user?.email;
    const notificationTracker = useNotificationTracker(email);

    useEffect(() => {
        if (notificationTracker !== undefined && notificationTracker.notificationList !== undefined) {
            for (let i = 0; i < notificationTracker.notificationList.length; i++) {
                const notif = notificationTracker.notificationList[i];
                // checks that the notification was created after the last time notifications were sent
                // adds 1000 to lastSent time because client and server TimeStamps seems to be slightly
                // misaligned
                if (
                    notificationTracker.lastSent === undefined ||
                    notif.createdAt.toDate().getTime() > notificationTracker?.lastSent.toDate().getTime() + 2000
                ) {
                    updateLastSent(user, notificationTracker);
                    addNotification({
                        title: notif.title,
                        subtitle: notif.subtitle,
                        message: notif.message,
                        native: true,
                    });
                    // hacky fix for duplicate notifs--server update to lastSent doesn't occur quickly enough
                    setTimeout(() => {}, 100);
                } else {
                    break;
                }
            }
        }
    }, [notificationTracker, user]);

    const handleClick = (e: globalThis.MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setShowMenu(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    });

    return (
        <div className="MenuBox" onBlur={() => setShowMenu(false)} ref={ref}>
            <header className="topBar">
                <div className="triggerArea">
                    <div className="logo" onClick={() => history.push("/home")}>
                        <img src={Logo} className="QMILogoImage" alt="Queue Me In Logo" />
                    </div>
                    <div className="viewToggles">
                        <CalendarHeader
                            currentCourseCode={(props.course && props.course.code) || "Courses"}
                            role={
                                props.user &&
                                props.course &&
                                (props.user.roles[props.course.courseId] || "student" || props.admin)
                            }
                        />
                        {props.role === "professor" && (
                            <ProfessorStudentToggle courseId={props.courseId} context={props.context} />
                        )}
                    </div>
                    <div className="rightContentWrapper">
                        <TopBarNotifications
                            notificationTracker={notificationTracker}
                            iconClick={() => setShowMenu(!showMenu)}
                            showMenu={showMenu}
                        />
                        <div className="userProfile" onClick={() => setShowMenu(!showMenu)}>
                            <img
                                src={image}
                                className="profilePic"
                                onError={() => setImage("/placeholder.png")}
                                alt="User Profile"
                            />
                            <span className="name">
                                {props.user
                                    ? props.user.firstName +
                                      " " +
                                      props.user.lastName +
                                      " (" +
                                      props.user.email.substring(0, props.user.email.indexOf("@")) +
                                      ")"
                                    : "Loading..."}
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
                            </span>{" "}
                            Log Out
                        </li>
                        <li onMouseDown={() => window.open("https://goo.gl/forms/7ozmsHfXYWNs8Y2i1", "_blank")}>
                            <span>
                                <Icon name="edit" />
                            </span>
                            Send Feedback
                        </li>
                        <li
                            onMouseDown={() => {
                                setShowMenu(false);
                                setShowTextModal(true);
                            }}
                        >
                            <span>
                                <Icon name="settings" />
                            </span>
                            SMS Settings
                        </li>
                    </ul>
                </>
            )}
            <TextNotificationModal showTextModal={showTextModal} setShowTextModal={setShowTextModal} user={user} />
            {props.snackbars.map((snackbar) => (
                <Snackbar icon={snackbar.icon} announcement={snackbar.text} />
            ))}
        </div>
    );
};

TopBar.defaultProps = {
    course: undefined,
    admin: false,
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
    snackbars: state.announcements.snackbars,
});

export default connect(mapStateToProps, {})(TopBar);
