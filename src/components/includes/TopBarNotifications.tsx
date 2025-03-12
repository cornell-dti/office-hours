import React, {useState, useRef, useEffect} from 'react';
import Moment from 'react-moment'
import { connect } from 'react-redux';
import notif from '../../media/notif.svg'
import notification from '../../media/notification.svg'
import ribbonNotif from '../../media/ribbon_notif.svg'
import {viewedTrackable, periodicClearNotifications} from '../../firebasefunctions/notifications'
import { RootState } from '../../redux/store';

type Props = {
    /** Notification Tracker keeps track of the list of notifications for a user */
    notificationTracker: NotificationTracker | undefined;
    /** User that is currently using QMI */
    user: FireUser | undefined;
    /** Function that sets showMenu to false or true */
    iconClick: () => void;
    /** Determines whether the profile menu should be shown or not */
    showMenu: boolean;
    /** Determines whether the wrapped countdown has reached 0 */
    countdownZero?: boolean | undefined;
    setDisplayWrapped?: React.Dispatch<React.SetStateAction<boolean>>;
};

const TopBarNotifications = (
    { notificationTracker, user, showMenu, iconClick, countdownZero, setDisplayWrapped }: Props) => {
    const [dropped, toggleDropped] = useState(false);
    const [hasWrapped, setHasWrapped] = useState(false);

    const notifications = notificationTracker?.notificationList?.sort((a, b) => {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    });


    const [hasViewed, toggleHasViewed] = useState(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate());

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log("component remounted, initial hasViewed " + hasViewed);
    });

    useEffect(() => {
        if (notificationTracker && notifications && notifications.length > 0) {
            const newHasViewed = notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate();
            if (newHasViewed !== hasViewed) {
                toggleHasViewed(newHasViewed);
            }       
        }
    }, [hasViewed, notificationTracker, notifications]);

    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * This function calls a firebase function that keeps track of which 
     * notifications have been viewed and updates the firebase 
     */
    const updateTrackable = () => {
        // eslint-disable-next-line no-console
        console.log("trackable called");
        viewedTrackable(user, notificationTracker, true)
        // eslint-disable-next-line no-console
        console.log("updated firebase");
    }

    useEffect(() => {
        if (user && user.wrapped) {
            setHasWrapped(true);
        } else {
            setHasWrapped(false);
        }
    }, [user]);

    useEffect(() => {
        if(notificationTracker !== undefined && !hasViewed && dropped) {
            periodicClearNotifications(user, notificationTracker);
        }
        // toggleHasViewed(notificationTracker === undefined || 
        // notifications === undefined || notifications.length === 0 ||
        // notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate())
        // eslint-disable-next-line no-console
        console.log("useEffect for clearnotifs called");
    }, [notificationTracker, notifications, user, dropped, hasViewed])

    const getColor = (currNotif: SessionNotification) => {
        if (
            notificationTracker !== undefined 
            && notificationTracker.notifications < currNotif.createdAt
        ) {
            return "#d6eafe"
        }
        return "#ffffff"
    }

    /**
     * This function handles the mouse click event when the user clicks out of the
     * notifications dropdown element. 
     * 
     * This function checks if the click occurred outside of the dropdown element
     * and if so, closes the dropdown and calls updateTrackable if the dropdown was open.
     * 
     * @param e The MouseEvent that is triggered by the click action.
     */
    const onClickOff = (e: MouseEvent) => {
        // eslint-disable-next-line no-console
        console.log("clicked off");
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            toggleDropped(false);
            if(dropped) {
                updateTrackable();
                // toggleHasViewed(true);
                // eslint-disable-next-line no-console
                console.log("called updateTrackable");
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log("hasViewed: " + hasViewed);
    }, [hasViewed]);

    useEffect(() => {
        document.addEventListener('mousedown', onClickOff);
        return () => {
            document.removeEventListener('mousedown', onClickOff);
        }
    })

    const iconClicked = () => {
        if (showMenu) {
            iconClick();
        }
        if (dropped) {
            updateTrackable();
        }
        toggleDropped(!dropped);
    }

    const handleNotifClick = () => {
        if (setDisplayWrapped) {
            // Check if the setter exists
            setDisplayWrapped(true); // Set the state to true
        }
    };

    return (
        <div ref={dropdownRef}>
            <div className="notifications__top" onMouseDown={(e) => e.stopPropagation()} onClick={() => iconClicked()}>
                <img
                    className="notifications__icon"
                    src={countdownZero && hasWrapped ? ribbonNotif : notification}
                    alt="Notification icon"
                />
                {!hasViewed && 
                <img className="notifications__indicator" src={notif} alt="Notification indicator" />}
            </div>
            <div
                className={`notifications__dropdown notifications__${dropped ? "visible" : "hidden"}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Additional notification when countdownZero is true */}
                {hasWrapped && countdownZero && (
                    <div
                        onClick={() => handleNotifClick()}
                        className="notifications__notification"
                        style={{ backgroundColor: "#DBE8FD", borderRadius: "8px" }}
                    >
                        <div className="notification__header">
                            <div className="notification__title">Queue Me In Wrapped</div>
                        </div>
                        <div className="notification__content">
                            Queue Me In Wrapped has been added to your notifications queue.
                            You can revisit your office
                            hour statistics any time by clicking here!
                        </div>
                    </div>
                )}
                {notifications === undefined || (notifications.length === 0 && !countdownZero) ? (
                    <div className="notification__placeholder">You do not have any notifications</div>
                ) : (
                    notifications.map((notific, index) => (
                        <div
                            className="notifications__notification"
                            style={{ background: getColor(notific) }}
                            key={index}
                        >
                            <div className="notification__header">
                                <div className="notification__title">{notific.subtitle}</div>
                                <Moment
                                    className="notification__date"
                                    date={notific.createdAt.toDate()}
                                    interval={0}
                                    format={"hh:mm a"}
                                />
                            </div>
                            <div className="notification__content">{notific.message}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})(TopBarNotifications);
TopBarNotifications.defaultProps = { countdownZero: false, setDisplayWrapped: () => {} };