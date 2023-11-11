import React, { useState } from "react";
import "./FeedbackPrompt.scss";
import TextField from "@material-ui/core/TextField";
import { Button } from "semantic-ui-react";
// import Rating from '@material-ui/lab/Rating';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

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
        <div className="submitFeedbackPopupBackground">
            <div className="submitFeedbackPopupContainer">
                Submit Feedback! Submit Feedback!Submit Feedback!Submit Feedback!Submit Feedback!

                <Box component="fieldset" mb={3} borderColor="transparent">
                    <Typography component="legend">Rate your TA out of 5 stars!</Typography>
                    {/* <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={ 
                            (event, newValue) => {
                            setRating(newValue); }

                        }
                    /> */}
                </Box>
                <div className={"body"}>
                    <>
                        You can also give written feedback
                        <TextField
                            id="outlined-multiline-static"
                            label="Multiline"
                            multiline
                            defaultValue="Write feedback for your TA's or QMI"
                            // onBlur={(event) => setFeedback(event.target.value)}
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
        </div>
    );
};

export default FeedbackPrompt;