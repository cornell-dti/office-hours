import React, {useState, useRef, useEffect} from 'react';
import Moment from 'react-moment'
import { connect } from 'react-redux';
import notif from '../../media/notif.svg'
import notification from '../../media/notification.svg'
import {viewedTrackable, periodicClearNotifications} from '../../firebasefunctions/notifications'
import { RootState } from '../../redux/store';

type Props = {
    notificationTracker: NotificationTracker | undefined;
    user: FireUser | undefined;
}

const TopBarNotifications = ({notificationTracker, user}: Props) => {
    const [dropped, toggleDropped] = useState(false);

    const notifications = notificationTracker?.notificationList?.sort((a, b) => {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    });


    const [hasViewed, toggleHasViewed] = useState(notificationTracker === undefined || 
        notifications === undefined || notifications.length === 0 ||
        notificationTracker.notifications.toDate() >= notifications[0].createdAt.toDate());

    const dropdownRef = useRef<HTMLDivElement>(null);

    const updateTrackable = () => {
        viewedTrackable(user, notificationTracker, true)
    }

    useEffect(() => {
        if(notificationTracker !== undefined) {
            periodicClearNotifications(user, notificationTracker);
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
                    notifications.map((notific, index) => (<div 
                        className="notifications__notification" 
                        style={{background: getColor(notific)}} 
                        key={index}
                    >
                        <div className="notification__header">
                            <div className="notification__title">{notific.subtitle}</div>
                            <Moment 
                                className="notification__date" 
                                date={notific.createdAt.toDate()} 
                                interval={0} 
                                format={'hh:mm a'} 
                            />
                        </div>
                        <div className="notification__content">
                            {notific.message}
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