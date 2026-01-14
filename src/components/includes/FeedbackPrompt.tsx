import React, { useEffect, useRef, useState } from "react";
import "../../styles/FeedbackPrompt.scss";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const FEEDBACK_CHAR_LIMIT = 1000;
const Asterisk = () => <span className="required"> * </span>;

type RatingRowProps = {
    title: string;
    label: string;
    value: number;
    setValue: (v: number) => void;
}

const RatingRow: React.FC<RatingRowProps> = ({ title, label, value, setValue }) => (
    <div className="rating-row">
        <Typography variant="body2" style={{ fontStyle: "roboto", fontSize: "16px", marginBottom: "16px"}}>
            <b>{title}</b> - {label}
        </Typography>
        <div className="rating-input">
            <Typography
                className="rating-left"
                variant="h6"
                style={{ fontStyle: "roboto", 
                    fontSize: "14px", fontWeight: "400", color: "#888" }}
            >
                Not at all
            </Typography>
            <div className="radio-group">
                {[1, 2, 3, 4, 5].map((n: number) => (
                    <label key={n} className="radio-option" htmlFor={title}>
                        <input
                            type="radio"
                            name={title}
                            id={title}
                            value={n}
                            checked={value === n}
                            onChange={() => setValue(n)}
                        />
                        <span>{n}</span>
                    </label>
                ))}
            </div>
            <Typography
                className="rating-right"
                variant="h6"
                style={{ fontStyle: "roboto", 
                    fontSize: "14px", fontWeight:"400", color: "#888" }}
            >
                Excellent
            </Typography>
        </div>
        
    </div>
    
);

type Props = {
    onClose: (rating1?: number, rating2?: number, rating3?: number, feedback?: string, 
        sessionId?: string) => void;
    closeFeedbackPrompt: () => void;
    
};



const FeedbackPrompt = (props: Props) => {
    const [organization, setOrganization] = useState<number>(0);
    const [efficiency, setEfficiency] = useState<number>(0);
    const [overall, setOverall] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>("");
    const [sessionId, setSessionId] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                alert('Please fill out either the ratings or the feedback field!');
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

                <Typography
                    variant="h4"
                    style={{ fontWeight: "600", color: "#484848", 
                        fontStyle: "roboto"}}
                >TA Feedback Form</Typography>

                <Typography
                    variant="body1"
                    style={{ fontStyle: "roboto", fontSize: "18px", 
                        fontWeight: "500", color:"#D81919"}}
                >
                    Please fill out at least the written feedback field, or all the ratings.
                </Typography>

                <Typography variant="body2" style={{ fontStyle: "roboto", fontSize: "16px" }}>
                    Your responses are <b>anonymous</b> and will help TAs improve future office hours.
                </Typography>
                <div className="feedback">
                    <div className="feedback-left">
                        <RatingRow 
                            title="Organization" 
                            label="How well-structured was the session?" 
                            value={organization} 
                            setValue={setOrganization} 
                        />
                        <RatingRow 
                            title="Efficiency" 
                            label="How effectively was the time used to address questions?" 
                            value={efficiency} 
                            setValue={setEfficiency} 
                        />
                        <RatingRow 
                            title="Overall Experience" 
                            label="How helpful was the session overall?" 
                            value={overall} 
                            setValue={setOverall}
                        />
                    </div>
                    
                    <div className="feedback-right">
                        <Typography
                            variant="body2"
                            style={{ fontStyle: "roboto", fontSize: "16px", 
                                marginBottom: "16px", textAlign: "left" }}
                        >
                            {/* eslint-disable-next-line max-len */}
                            <b>Open Feedback</b> - Eg. What could be improved to make future sessions more effective? Did you feel comfortable asking questions?
                        </Typography>
                        <TextField
                            id="outlined-multiline-static"
                            variant="outlined"
                            multiline
                            minRows={6}
                            maxRows={10}
                            fullWidth
                            style={{ marginBottom: "5px", borderRadius: "12px" }}
                            placeholder="Write your thoughts here..."
                            value={feedback}
                            /* Adds a character limit to the feedback response */
                            inputProps={{
                                style: {
                                    overflow: 'auto',
                                },
                                maxLength: FEEDBACK_CHAR_LIMIT, 
                            }}
                            // Uses handleUpdateFeedback to limit response
                            onChange={handleUpdateFeedback}
                        />
                        <Typography
                            variant="caption"
                            color={feedback.length >= FEEDBACK_CHAR_LIMIT ? "error" : "textSecondary"}
                            style={{
                                position: "relative",
                                textAlign: "left",
                                color: "rgba(0, 0, 0, 0.6)",
                            }}
                        >
                            ({FEEDBACK_CHAR_LIMIT - feedback.length} character
                            {FEEDBACK_CHAR_LIMIT - feedback.length !== 1 ? "s" : ""} left)
                            <Asterisk />
                        </Typography>

                    </div>
                </div>

                <Button
                    variant="contained"
                    onClick={() => {
                        if ((organization && efficiency && overall) || feedback) {
                            setSessionId(sessionId);
                            props.onClose(organization, efficiency, overall, feedback, sessionId);
                        }
                        props.closeFeedbackPrompt();
                    }}
                    style={{ position: "absolute", bottom: "2rem", right: "1.8rem", textTransform: "none",
                        fontWeight: "400", fontSize: "16px"}}
                    className="button-accept"
                    disabled={(!organization || !efficiency || !overall) && !feedback}
                >
                    Submit Feedback
                </Button>
            </div>
        </div>
    );
};

export default FeedbackPrompt;
