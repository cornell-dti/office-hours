import React, { useEffect, useRef, useState } from "react";
import "../../styles/FeedbackPrompt.scss";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Rating from "@material-ui/lab/Rating";
import Typography from "@material-ui/core/Typography";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const FEEDBACK_CHAR_LIMIT = 1000;
const Asterisk = () => <span className="required"> * </span>;
const LOCATION_INPUTTED = 40;
const QUESTION_INPUTTED = 50;
const INITIAL_STATE = 10;

type Props = {
    onClose: (rating1?: number, rating2?: number, rating3?: number, feedback?: string) => void;
    closeFeedbackPrompt: () => void;
};



const FeedbackPrompt = (props: Props) => {
    const [rating1, setRating1] = useState<number | null>(0);
    const [rating2, setRating2] = useState<number | null>(0);
    const [rating3, setRating3] = useState<number | null>(0);
    const [feedback, setFeedback] = useState<string>("");
    const [stage, setStage] = useState<number>(INITIAL_STATE);
    const [missingQuestion, setMissingQuestion] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                props.closeFeedbackPrompt();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef, props]);

    // Prevents responder from writing a review over 1000 charachters long. 
    const handleUpdateFeedback = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        setFeedback(target.value.length <= FEEDBACK_CHAR_LIMIT ? target.value : feedback);
    };

    /* TODO (richardgu): handle rating/form verification so we only save valid feedback 
    into Firestore, make things look nicer.
    */
    return (
        <div className="submitFeedbackPopupBackground">
            <div className="submitFeedbackPopupContainer" ref={containerRef}>
                <IconButton
                    style={{ position: "absolute", top: "0.2rem", right: "0.2rem" }}
                    onClick={props.closeFeedbackPrompt}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6"> Feedback for TA</Typography>

                <Typography variant="body1" style={{ fontStyle: "roboto", fontSize: "16px" }}>
                    How was your experience?
                </Typography>

                <Typography variant="body2" style={{ fontStyle: "roboto", fontSize: "14px" }}>
                    Your response will remain anonymous.
                </Typography>
                <Typography variant="body2" style={{ fontStyle: "roboto", fontSize: "14px" }}>
                    Organization
                </Typography>
                <Box component="fieldset" mb={3} borderColor="transparent">
                    <Rating
                        name="simple-controlled1"
                        value={rating1}
                        onChange={(event: any, newValue: React.SetStateAction<number | null>) => {
                            setRating1(newValue);
                        }}
                        size="large"
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                    <br />
                </Box>
                <Typography variant="body2" style={{ fontStyle: "roboto", fontSize: "14px" }}>
                    Efficiency
                </Typography>
                <Box component="fieldset" mb={3} borderColor="transparent">
                    <Rating
                        name="simple-controlled2"
                        value={rating2}
                        onChange={(event: any, newValue: React.SetStateAction<number | null>) => {
                            setRating2(newValue);
                        }}
                        size="large"
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                    <br />
                </Box>
                <Typography variant="body2" style={{ fontStyle: "roboto", fontSize: "14px" }}>
                    Overall Experience
                </Typography>
                <Box component="fieldset" mb={3} borderColor="transparent">
                    <Rating
                        name="simple-controlled3"
                        value={rating3}
                        onChange={(event: any, newValue: React.SetStateAction<number | null>) => {
                            setRating3(newValue);
                        }}
                        size="large"
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                    <br />
                </Box>
                <TextField
                    id="outlined-multiline-static"
                    variant="outlined"
                    multiline
                    minRows={4}
                    maxRows={5}
                    fullWidth
                    style={{ marginBottom: "4rem" }}
                    placeholder="Please describe your experience..."
                    value={feedback}
                    /* Adds a character limit to the feedback response */
                    inputProps={{
                        style: {
                            overflow: 'auto',
                        },
                        maxLength: FEEDBACK_CHAR_LIMIT, 
                    }}
                    //Uses handleUpdateFeedback to limit response
                    onChange={handleUpdateFeedback}
                />
                <Typography
                    variant="caption"
                    color={feedback.length >= FEEDBACK_CHAR_LIMIT ? "error" : "textSecondary"}
                    style={{
                        position: "relative",
                        bottom: "50px",
                        right: "138px",
                        color: "rgba(0, 0, 0, 0.6)",
                    }}
                >
                    ({FEEDBACK_CHAR_LIMIT - feedback.length} character
                    {FEEDBACK_CHAR_LIMIT - feedback.length !== 1 ? "s" : ""} left)
                    <Asterisk />
                </Typography>

                {/* Currently enable submission of blank feedback in order to not 
                block user flow */}
                <Button
                    variant="contained"
                    onClick={() => {
                        if (rating1 && rating2 && rating3) {
                            props.onClose(rating1, rating2, rating3, feedback);
                        }
                        props.closeFeedbackPrompt();
                    }}
                    style={{ position: "absolute", bottom: "2rem", right: "1.8rem" }}
                    color={rating1 && rating2 && rating3 ? "primary" : "default"}
                    disabled={!rating1 || !rating2 || !rating3}
                >
                    Submit Rating
                </Button>
            </div>
        </div>
    );
};

export default FeedbackPrompt;
