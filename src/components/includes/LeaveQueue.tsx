import React from 'react';
import Button from '@material-ui/core/Button'
import { Box } from '@material-ui/core';
import AlertIcon from '../../media/AlertIcon.png';
import CloseIcon from '../../media/CloseIcon.svg';

type Props = {
    setShowModal: (show: boolean) => void;
    showModal: boolean;
    removeQuestion: () => void;
}

const LeaveQueueModal = ({ setShowModal, showModal, removeQuestion }: Props) => {

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
                        <div className="leave-queue-prompt">
                            <img src={AlertIcon} alt="Alert" />
                            <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
                                <h2>Are you sure you want to leave the queue?
                                </h2>
                                This action cannot be undone
                            </div>
                        </div>
                        
                        <span style={{display: "flex", justifyContent: "space-evenly", marginBottom: "15px"}}>
                            <Button variant="outlined" color="primary" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Box width="10px"/>
                            <Button variant="contained" color="secondary" onClick={handleYes}>
                                Yes, remove me
                            </Button>
                        </span>
                    </div>
                </div>
            }
        </>
    )
}

export default LeaveQueueModal;