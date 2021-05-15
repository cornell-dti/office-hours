import React, {useState, useRef, useEffect} from 'react';
import Moment from 'react-moment'
import moment from 'moment-timezone';

import notif from '../../media/notif.svg'
import notification from '../../media/notification.svg'
import {viewedTrackable} from '../../firebasefunctions/notifications'
import { useNotifications } from '../../firehooks';

type Props = {
    notificationTracker : NotificationTracker | undefined;
    user : FireUser | undefined
}

const TopBarNotifications = ({notificationTracker, user} : Props) => {
    const [dropped, toggleDropped] = useState(false);

    const notifications = notificationTracker?.notificationList

    const [hasViewed, toggleHasViewed] = useState(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker!.notifications.toDate() >= notifications[0].createdAt.toDate());

    const dropdownRef = useRef<HTMLDivElement>(null);

    const updateTrackable = () => {
        viewedTrackable(user, notificationTracker, true)
    }

    useEffect(() => {
        toggleHasViewed(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker!.notifications.toDate() >= notifications[0].createdAt.toDate())
    }, [notificationTracker])

    const getColor = (notification : SessionNotification) => {
        if (
            notificationTracker !== undefined 
            && notificationTracker.notifications < notification!.createdAt
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
        toggleDropped(!dropped);
    }

    return (
        <div ref={dropdownRef}>
            <div className="notifications__top" onClick={() => iconClicked()}>
                <img className="notifications__icon" src={notification} alt="Bug fix icon" />
                {!hasViewed && <img className="notifications__indicator" src={notif} alt="Notification indicator" />}
            </div>
            <div  
                className={`notifications__dropdown notifications__${dropped ? "visible" : "hidden"}`} 
                onClick={e => e.stopPropagation()}
            >
                {notifications !== undefined && (notifications.length === 0 ? 
                    (<div className="notification__placeholder">You do not have any notifications</div> ) : 
                    notifications.map((notification, index) => (<div 
                        className="notifications__notification" 
                        style={{background : getColor(notification)}} 
                        key={index}
                    >
                        <div className="notification__header">
                            <div className="notification__title">{notification.subtitle}</div>
                            <Moment 
                                className="notification__date" 
                                date={moment.now()} 
                                interval={0} 
                                format={'HH:mm a'} 
                            />
                        </div>
                        <div className="notification__content">
                            {notification.message}
                        </div>
                    </div>)))}
                    {notifications === undefined && <div className="notification__placeholder">You do not have any notifications</div>}
                </div>
        </div>
    )
}



export default TopBarNotifications
