import React from 'react';
import AlertIcon from '../../media/AlertIcon.png';
import CloseIcon from '../../media/CloseIcon.svg';


type Props = {
    setShowModal: (show: boolean) => void;
    showModal: boolean;
    removeQuestion: () => void;
}

const LeaveQueueModal = ({setShowModal, showModal, removeQuestion}: Props) => {

    const handleYes = () => {
        removeQuestion();
        setShowModal(false);
    }

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
                    <img src={CloseIcon} alt="Close modal" />
                </button>
                <img src={AlertIcon} className="alert-icon" />
                <h2>Are you sure you want to remove yourself from the queue?
                </h2>
                <button
                    className="leave-queue-option yes-queue-button" 
                    type="button"
                    onClick={handleYes}
                > 
                    Yes
                </button>
                <button
                    className="leave-queue-option cancel-queue-button" 
                    type="button"
                    onClick={() => setShowModal(false)}
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