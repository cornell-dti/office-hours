import React, { useEffect, useState } from 'react';
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
    const [isMobile, setIsMobile] = useState(false);

    const handleYes = () => {
        removeQuestion();
        setShowModal(false);
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 860); // Adjust breakpoint as needed
        };

        // Initial check
        handleResize();

        // Listen for window resize events
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    /** Note that in the MUI Button - Box - Button component pattern below, we 
     * insert a Box component between the two buttons to add spacing between them.
     * This is a common pattern in MUI, and is used to add spacing between components.
     * Of course, for future extensability, we could also create a custom component
     * or change this to use margin instead. 
     */
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
                        <div className="leave-queue-body">
                            <div className="leave-queue-prompt">
                                <img src={AlertIcon} alt="Alert" />
                                <div style={{
                                    display: "flex", 
                                    flexDirection: "column", 
                                    alignItems: "flex-start",
                                    marginTop: isMobile ? "45px" : "0px", 
                                }}
                                >
                                    <h2 style={{marginBottom: "6px"}}>
                                        <strong>Are you sure you want to leave the queue?</strong>
                                    </h2>
                                    <div>This action cannot be undone</div>
                                </div>
                            </div>
                        
                            <span style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: isMobile ? "50px" : "15px",
                                marginTop: "15px",
                                textTransform: "none",
                            }}
                            >
                                <Button 
                                    variant="outlined" 
                                    color="primary"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        fontWeight: "normal",
                                        borderColor: "#3594F1",
                                        color: "#6597D6",
                                        marginLeft: "0.5rem",
                                        marginRight: isMobile ? "4rem" : "12.5rem",
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Box width="10px"/>
                                <Button 
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleYes}
                                    style={{
                                        fontWeight: "normal",
                                        backgroundColor: "#A42921",
                                    }}
                                >
                                    Yes, remove me
                                </Button>
                            </span>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default LeaveQueueModal;