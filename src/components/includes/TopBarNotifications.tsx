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
}

const TopBarNotifications = ({notificationTracker, user, showMenu, iconClick, countdownZero}: Props) => {
    const [dropped, toggleDropped] = useState(false);

    const notifications = notificationTracker?.notificationList?.sort((a, b) => {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    });


    const [hasViewed, toggleHasViewed] = useState(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate());

    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * This function calls a firebase function that keeps track of which 
     * notifications have been viewed and updates the firebase 
     */
    const updateTrackable = () => {
        viewedTrackable(user, notificationTracker, true)
    }

    useEffect(() => {
        if(notificationTracker !== undefined && !hasViewed && dropped) {
            periodicClearNotifications(user, notificationTracker);
        }
        toggleHasViewed(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate())
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

    const onClickOff = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            toggleDropped(false);
            if(dropped) {
                updateTrackable();
            }
        }
    }

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

    return (
        <div ref={dropdownRef}>
            <div className="notifications__top" onClick={() => iconClicked()}>
                <img
                    className="notifications__icon"
                    src={countdownZero ? ribbonNotif : notification}
                    alt="Notification icon"
                />
                {!hasViewed && <img className="notifications__indicator" src={notif} alt="Notification indicator" />}
            </div>
            <div
                className={`notifications__dropdown notifications__${dropped ? "visible" : "hidden"}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Additional notification when countdownZero is true */}
                {countdownZero && (
                    <div
                        className="notifications__notification"
                        style={{ backgroundColor: "#DBE8FD", borderRadius: "8px" }}
                    >
                        <div className="notification__header">
                            <div className="notification__title">Queue Me In Wrapped</div>
                        </div>
                        <div className="notification__content">
                            Queue Me In Wrapped has been added to your notifications queue. You can revisit your office
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
TopBarNotifications.defaultProps = { countdownZero: false };