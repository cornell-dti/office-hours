import React from 'react';
import { Icon } from 'semantic-ui-react';
import AlertIcon from '../../media/AlertIcon.png';


type Props = {
    setShowModal: (show: boolean) => void;
    showModal: boolean;
}

const LeaveQueueModal = ({setShowModal, showModal}: Props) => {
    return (
        <>
            {showModal &&
        <div className="leave-queue-background">
            <div className="leave-queue-container">
                <button
                    className="leave-queue-button"
                    onClick={() => 
                        setShowModal(false)}
                    type="button"
                >
                    <Icon name="x" size="large" />
                </button>
                <img src={AlertIcon} className="alert-icon" />
                <h2>Are you sure you want to remove yourself from the queue?
                </h2>
                <button
                    className="leave-queue-option yes-queue-button" 
                    type="button"
                > 
                    Yes
                </button>
                <button
                    className="leave-queue-option cancel-queue-button" 
                    type="button"
                >
                    Cancel & Go Back
                </button>
            </div>
        </div>
            }
        </>
    )
}

export default LeaveQueueModal;