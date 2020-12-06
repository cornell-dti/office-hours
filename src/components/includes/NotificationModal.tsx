import React, { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import NotifBell from '../../media/notifBell.svg';

type Props = {
    show: boolean;
};

const NotificationModal = ({ show }: Props) => {

    const [showNotifModal, setShowNotifModal] = useState(show);
    const isShown = showNotifModal ? "Visible" : "";

    const closeModal = () => {
        setShowNotifModal(false);
    }

    return (
        <>
            {showNotifModal &&
                <div className="NotifModalScreen">
                    <div className={'NotificationModal' + isShown}>
                        <button type="button" className="closeButton" onClick={closeModal}><Icon name="x" /> </button>
                        <img src={NotifBell} alt="Notification Bell" />
                        <p>Enable browser notifications to know when it's your turn</p>
                    </div>
                </div>
            }

        </>
    );
};

export default NotificationModal;

