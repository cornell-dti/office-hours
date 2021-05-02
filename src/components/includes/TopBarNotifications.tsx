import React, {useState, useRef, useEffect} from 'react';
import Moment from 'react-moment'
import moment from 'moment-timezone';

import notif from '../../media/notif.svg'
import notification from '../../media/notification.svg'


const TopBarNotifications = () => {
    const [dropped, toggleDropped] = useState(false);
    const [hasViewed, toggleHasViewed] = useState(false);

    const forMap = [1,2,3]

    const dropdownRef = useRef<HTMLDivElement>(null);

    const onClickOff = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            toggleDropped(false);
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', onClickOff);
        return () => {
            document.removeEventListener('mousedown', onClickOff);
        }
    })

    const iconClicked = () => {
        toggleDropped(true)
        toggleHasViewed(true);
    }

    return (
        <>
            <div className="notifications__top" onClick={() => iconClicked()}>
                <img className="notifications__icon" src={notification} alt="Bug fix icon" />
                {!hasViewed && <img className="notifications__indicator" src={notif} alt="Notification indicator" />}
            </div>
            <div 
                ref={dropdownRef} 
                className={`notifications__dropdown notifications__${dropped ? "visible" : "hidden"}`} 
                onClick={e => e.stopPropagation()}
            >
                {forMap.map(() => (<div className="notifications__notification">
                    <div className="notification__header">
                        <div className="notification__title">Your question has been answered</div>
                        <Moment 
                            className="notification__date" 
                            date={moment.now()} 
                            interval={0} 
                            format={'HH:mm a'} 
                        />
                    </div>
                    <div className="notification__content">
                        "How do I implement remove in a red black binary searc..."
                    </div>
                </div>))}
            </div>
        </>
    )
}



export default TopBarNotifications
