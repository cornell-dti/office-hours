/** Modal component for QMI Wrapped */

import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import "../../styles/Wrapped.scss";
import React, { useState } from "react";

type Props = {
    onClose: () => void;
};

type DotProps = {
    active: boolean;
  };
  
const Dot: React.FC<DotProps> = ({ active }) => (
    <div className={`dot ${active ? 'active' : ''}`}></div>
);

const Wrapped: React.FC<Props> = (props: Props) => {
    const [stage, setStage] = useState<number>(0);
    const totalStages = 4;

    const navigateStage = (direction: 'prev' | 'next') => {
        setStage(currentStage => {
            if (direction === 'prev') {
                return currentStage > 0 ? currentStage - 1 : 0;
            } else {
                return currentStage < totalStages - 1 ? currentStage + 1 : totalStages - 1;
            }
        });
    };

    const DotsIndicator: React.FC<{ stage: number }> = ({ stage }) => (
        <div className="dotsContainer">
          {[...Array(totalStages)].map((_, index) => ( 
            <Dot key={index} active={index === stage} />
          ))}
        </div>
      );
      

    const Welcome: React.FC = () => (
        <div>
            <IconButton
                style={{ position: "absolute", top: "0.2rem", right: "0.2rem", color: "#FFFFFF" }}
                onClick={props.onClose}
            >
                <CloseIcon />
            </IconButton>
            <div style={{ display: "flex", flexDirection: "column", width: "400px", justifyContent: "space-between" }}>
                <div style={{ alignSelf: "flex-start" }}>
                    <Typography variant="h2" style={{ fontWeight: "bold" }}> Queue Me In</Typography>
                </div>
                <div style={{ alignSelf: "flex-end" }}>
                    <Typography variant="h1" style={{ fontWeight: "bold" }}> Wrapped</Typography>
                </div>
            </div>
        </div>
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
                <div className="navigateStage prev" onClick={() => navigateStage('prev')}> 
                    <ArrowBackIosIcon />
                </div>
                {stage === 0 && <Welcome />}
                {stage === 1 && <Visits />}
                {stage === 2 && <TimeSpent />}
                {stage === 3 && <PersonalityType />}
                <DotsIndicator stage={stage} />
                <div className="navigateStage next" onClick={() => navigateStage('next')}>
                    <ArrowForwardIosIcon />
                </div>
            </div>
        </div>
    );
};


export default Wrapped;