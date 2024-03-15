import React, { useEffect, useRef, useState } from "react";
import "./FeedbackPrompt.scss";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Rating from '@material-ui/lab/Rating';
// import ReactStars from 'react-stars';
import Typography from '@material-ui/core/Typography';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

type Props = {
    onClose: (rating?: number, feedback?: string) => void;
    closeFeedbackPrompt: () => void;
};

const FeedbackPrompt = (props: Props) => {
    const [rating, setRating] = useState<number | null>(0);
    const [feedback, setFeedback] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                props.closeFeedbackPrompt();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [containerRef, props]);

    /* TODO (richardgu): handle rating/form verification so we only save valid feedback 
    into Firestore, make things look nicer.
    */
    return (
        <div className="submitFeedbackPopupBackground">
            <div className="submitFeedbackPopupContainer" ref={containerRef}>
               
                <IconButton
                    style={{position: "absolute", top: "0.2rem", right: "0.2rem"}}
                    onClick={props.closeFeedbackPrompt}
                >
                    <CloseIcon />
                </IconButton>
          
                <Typography variant="h6"> Feedback for TA</Typography>
                    
                <Typography variant="body1" style={{fontStyle: "roboto", fontSize: "16px"}}>
                    How was your experience?
                </Typography>
                
                <Typography variant="body2" style={{fontStyle: "roboto", fontSize: "14px"}}> 
                    Your response will remain anonymous. 
                </Typography>
                <Box component="fieldset" mb={3} borderColor="transparent">
                    {/* <Typography component="legend">Rate your TA out of 5 stars!</Typography> */}
                    <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={(event: any, newValue: React.SetStateAction<number | null>) => {
                            setRating(newValue); }
                        }
                        size="large"
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                    {/* <ReactStars 
                        count={5}
                        onChange={(newRating: React.SetStateAction<number | null>) => {
                            setRating(newRating);
                        }}
                        size={36}
                        color2={'#77BBFA'} 
                        half={false}
                        value={rating || 0}
                    /> */}
                    {/* <Rating maxRating={5} defaultRating={0} icon='star' 
                    size='large' onRate={(event, data) => setRating(event.detail)}/> */}
                    <br />
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
                    onClick={() => {
                        props.onClose(rating || undefined, feedback); 
                        props.closeFeedbackPrompt();
                    }}
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