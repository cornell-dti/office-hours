/** Modal component for QMI Wrapped */

import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import "../../styles/Wrapped.scss";
import React, { useEffect, useState } from "react";
import People from "../../media/ppl.svg"
import Bus from "../../media/bus.svg"

type Props = {
    onClose: () => void;
};

type DotProps = {
    active: boolean;
};
  
const Dot: React.FC<DotProps> = ({ active }) => (
    <div className={`dot ${active ? 'active' : ''}`} />
);

const Wrapped: React.FC<Props> = (props: Props) => {
    const [stage, setStage] = useState<number>(0);
    const [showBanner, setShowBanner] = useState(false);
    const totalStages = 5;

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowBanner(true);
        }, 1000); 
    
        return () => clearTimeout(timer);
    }, []);

    const navigateStage = (direction: 'prev' | 'next') => {
        setStage(currentStage => {
            if (direction === 'prev') {
                return currentStage > 0 ? currentStage - 1 : 0;
            } 
            return currentStage < totalStages - 1 ? currentStage + 1 : totalStages - 1;
            
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
            <div style={{ display: "flex", flexDirection: "column", width: "400px", justifyContent: "space-between" }}>
                <div style={{ alignSelf: "flex-start" }}>
                    <Typography variant="h2" style={{ fontWeight: "bold" }}> Queue Me In</Typography>
                </div>
                <div style={{ alignSelf: "flex-end" }}>
                    <Typography variant="h1" style={{ fontWeight: "bold" }}> Wrapped</Typography>
                </div>
                <div className="animationContainer">
                    {showBanner && (
                        <>
                            <div className="banner top-right">
                                SPRING 2024 SPRING 2024 SPRING 2024
                            </div>
                            <div className="banner bottom-left">
                                SPRING 2024 SPRING 2024 SPRING 2024
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )

    const Visits: React.FC = () => (
        <div>
            <div style={{ display: "flex", flexDirection: "column", width: "750px", justifyContent: "space-between" }}>
                <div style={{ fontWeight: "bold", alignSelf: "flex-start"}}>
                    <Typography variant="h3">
                        You worked so hard this semester!
                    </Typography>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <img 
                        src={People}
                        style={{ 
                            width: "24rem", 
                            position: "absolute", 
                            left: "2rem", 
                            bottom: "0.5rem" 
                        }}
                        alt=""
                    />
                    <div 
                        style={{ 
                            display: "flex", 
                            fontWeight: "bold", 
                            width: "300px",
                            alignSelf: "flex-end", 
                            alignContent: "flex-start"
                        }}
                    >
                        <Typography variant="h3"> 
                            YOU VISITED OFFICE HOURS X TIMES
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    )

    const TimeSpent: React.FC = () => (
        <>
            <Typography variant="h2" style={{ fontWeight: "bold" }}> 
                YOU SPENT X MINUTES AT OFFICE HOURS
            </Typography>
        </>
    )

    const PersonalityType: React.FC = () => (
        <>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h3" style={{ fontWeight: "bold"}}> 
                    Your office hour personality type is...
                </Typography>
            </div>
        </>
    )

    const Conclusion: React.FC = () => (
        <>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography 
                    variant="h4" 
                    style={{ 
                        color: "#FFDBA6", 
                        fontWeight: "bold", 
                        position: "absolute", 
                        top: "2rem" 
                    }}
                > 
                    Pat yourself on the back!
                </Typography>
                <Typography variant="h3" style={{ fontWeight: "bold" }}> 
                    IT'S TIME FOR A WELL DESERVED BREAK
                </Typography>
                <img 
                    src={Bus} 
                    style={{ 
                        width: "25rem", 
                        position: "absolute", 
                        right: "1rem", 
                        bottom: "0.5rem" 
                    }} 
                    alt="" 
                />
            </div>
        </>
    )

    return (
        <div className="wrappedBackground">
            <div className="wrappedContainer">
                {stage !== 0 && 
                    <div className="navigateStage prev" onClick={() => navigateStage('prev')}> 
                        <ArrowBackIosIcon />
                    </div>
                }
                
                {stage === 0 && <Welcome />}
                {stage === 1 && <Visits />}
                {stage === 2 && <TimeSpent />}
                {stage === 3 && <PersonalityType />}
                {stage === 4 && <Conclusion />}
                <DotsIndicator stage={stage} />
                {stage !== totalStages - 1 && 
                    <div className="navigateStage next" onClick={() => navigateStage('next')}>
                        <ArrowForwardIosIcon />
                    </div>
                }
                <IconButton
                    style={{ position: "absolute", top: "0.2rem", right: "0.2rem", color: "#FFFFFF" }}
                    onClick={props.onClose}
                >
                    <CloseIcon />
                </IconButton>
            </div>
        </div>
    );
};


export default Wrapped;