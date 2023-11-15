import React, { useState } from "react";
import "./FeedbackPrompt.scss";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Rating from '@material-ui/lab/Rating';
import Typography from '@material-ui/core/Typography';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import Box from '@material-ui/core/Box';

type Props = {
    questionId: string;
    isOpen: boolean;
    onClose: (rating?: number, feedback?: string) => void;
};

const FeedbackPrompt = (props: Props) => {
    const [rating, setRating] = useState<number | null>(0);
    const [feedback, setFeedback] = useState<string>("");

    /* TODO (richardgu): handle rating/form verification so we only save valid feedback 
    into Firestore, make things look nicer.
    */
    return (
        <div className="submitFeedbackPopupBackground">
            <div className="submitFeedbackPopupContainer">
                <Typography variant="h6"> Feedback for TA</Typography>
                    
                <Typography variant="body1"> How was your experience?</Typography>
                
                <Typography variant="body2"> Your response will remain anonymous. </Typography>
                <Box component="fieldset" mb={3} borderColor="transparent">
                    {/* <Typography component="legend">Rate your TA out of 5 stars!</Typography> */}
                    <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue); }
                        }
                        size="large"
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                </Box>
            
                    
                <TextField
                    id="outlined-multiline-static"
                    variant="outlined"
                    multiline
                    minRows={4}
                    fullWidth
                    style={{ marginBottom: "4rem" }}
                    placeholder="Please describe your experience..."
                    onChange={(event) => setFeedback(event.target.value)}
                />
               
                <Button
                    variant="contained"
                    onClick={() => props.onClose(rating || undefined, feedback)}
                    style={{position: "absolute", bottom: "2rem", right: "1.8rem"}}
                    color={(rating && feedback?.length > 0) ? "primary" : "default"}
          
                >
                    Submit Rating
                </Button>
       
                   
            </div>
        </div>
    );
};

export default FeedbackPrompt;