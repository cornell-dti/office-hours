import React, {useState, useRef, useEffect} from 'react';
import Moment from 'react-moment'
import moment from 'moment-timezone';

import { connect } from 'react-redux';
import notif from '../../media/notif.svg'
import notification from '../../media/notification.svg'
import {viewedTrackable, clearNotifications} from '../../firebasefunctions/notifications'
import { RootState } from '../../redux/store';

type Props = {
    notificationTracker: NotificationTracker | undefined;
    user: FireUser | undefined;
}

const TopBarNotifications = ({notificationTracker, user}: Props) => {
    const [dropped, toggleDropped] = useState(false);

    const notifications = notificationTracker?.notificationList

    const [hasViewed, toggleHasViewed] = useState(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate());

    const dropdownRef = useRef<HTMLDivElement>(null);

    const updateTrackable = () => {
        viewedTrackable(user, notificationTracker, true)
    }

    useEffect(() => {
        if(notificationTracker !== undefined) {
            clearNotifications(user);
        }
        toggleHasViewed(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate())
    }, [notificationTracker, notifications, user])

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
        if(dropped) {
            updateTrackable();
        }
        toggleDropped(!dropped);
    }

    return (
        <div ref={dropdownRef}>
            <div className="notifications__top" onClick={() => iconClicked()}>
                <img className="notifications__icon" src={notification} alt="Notification icon" />
                {!hasViewed && <img className="notifications__indicator" src={notif} alt="Notification indicator" />}
            </div>
            <div  
                className={`notifications__dropdown notifications__${dropped ? "visible": "hidden"}`} 
                onClick={e => e.stopPropagation()}
            >
                {notifications === undefined || notifications.length === 0 ? 
                    (<div className="notification__placeholder">You do not have any notifications</div> ):
                    notifications.map((notif, index) => (<div 
                        className="notifications__notification" 
                        style={{background: getColor(notif)}} 
                        key={index}
                    >
                        <div className="notification__header">
                            <div className="notification__title">{notif.subtitle}</div>
                            <Moment 
                                className="notification__date" 
                                date={moment.now()} 
                                interval={0} 
                                format={'HH:mm a'} 
                            />
                        </div>
                        <div className="notification__content">
                            {notif.message}
                        </div>
                    </div>))}
            </div>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})(TopBarNotifications);