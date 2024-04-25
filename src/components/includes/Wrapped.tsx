/** Modal component for QMI Wrapped */

import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import "../../styles/Wrapped.scss";
import React, { useState } from "react";

type Props = {
    onClose: () => void;
};

const Wrapped: React.FC<Props> = (props: Props) => {
    const [stage, setStage] = useState<number>(0);

    const Welcome: React.FC = () => (
            <>
                <IconButton
                    style={{position: "absolute", top: "0.2rem", right: "0.2rem"}}
                    onClick={props.onClose}
                >
                    <CloseIcon />
                </IconButton>
        
                <Typography variant="h6"> QMI Wrapped!</Typography>
              
                <Typography variant="body2" style={{fontStyle: "roboto", fontSize: "14px"}}> 
                    Body text for QMI Wrapped 
                </Typography>
            </>
    )

    const Visits: React.FC = () => (
        <>
        </>
    )

    const TimeSpent: React.FC = () => (
        <>
        </>
    )

    const PersonalityType: React.FC = () => (
        <>
        </>
    )

    const Conclusion: React.FC = () => (
        <></>
    )

    return (
        <div className="wrappedBackground">
            <div className="wrappedContainer">
                {stage === 0 && <Welcome />}
                {stage === 1 && <Visits />}
                {stage === 2 && <TimeSpent />}
                {stage === 3 && <PersonalityType />}
            </div>
        </div>
    );
};


export default Wrapped;