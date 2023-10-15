import React, { useState } from "react";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Rating from "@mui/material/Rating";
import TextField from "@material-ui/core/TextField";
import { Button } from "semantic-ui-react";

type Props = {
    questionId: string;
    isOpen: boolean;
    onClose: (rating?: number, feedback?: string) => void;
};

const FeedbackPrompt = (props: Props) => {
    const [rating, setRating] = useState<number | null>(0);
    const [feedback, setFeedback] = useState<string>();

    /* TODO (richardgu): handle rating/form verification so we only save valid feedback 
    into Firestore, make things look nicer.
    */
    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={props.isOpen}
            onClose={() => props.onClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={props.isOpen}>
                <Box className={"boxStyle"}>
                    <>
                        <div className={"content"}>
                            <div className={"header"}> Rate your office hours experience! </div>
                            <Rating
                                name="simple-controlled"
                                value={rating}
                                onChange={(event, newValue) => {
                                    setRating(newValue);
                                }}
                            />
                            <div className={"body"}>
                                <>
                                    You can also give written feedback
                                    <TextField
                                        id="outlined-multiline-static"
                                        label="Multiline"
                                        multiline
                                        rows={4}
                                        defaultValue="Write feedback for your TA's or QMI"
                                        onBlur={(event) => setFeedback(event.target.value)}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => props.onClose(rating || undefined, feedback)}
                                    >
                                        Submit Feedback
                                    </Button>
                                </>
                            </div>
                        </div>
                    </>
                </Box>
            </Fade>
        </Modal>
    );
};

export default FeedbackPrompt;
