import React, { useState } from "react";
import "./FeedbackPrompt.scss";
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
        <div className="submitFeedbackPopupBackground">
            <div className="submitFeedbackPopupContainer">
                Submit Feedback!
                <div className={"body"}>
                    <>
                        You can also give written feedback
                        <TextField
                            id="outlined-multiline-static"
                            label="Multiline"
                            multiline
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
        </div>
    );
};

export default FeedbackPrompt;