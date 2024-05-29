/** Modal component for QMI Wrapped */

import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import "../../styles/Wrapped.scss";
import React, { useEffect, useState } from "react";
import firebase from '../../firebase';
import People from "../../media/ppl.svg"
import Bus from "../../media/bus.svg"
import ConsistentPersonality from "../../media/consistent_personality.svg"
import ResourcefulPersonality from "../../media/resourceful_personality.svg"
import IndependentPersonality from "../../media/independent_personality.svg"

type Props = {
    user: FireUser | undefined;
    onClose: () => void;
};

type DotProps = {
    active: boolean;
};
  
const Dot: React.FC<DotProps> = ({ active }) => (
    <div className={`dot ${active ? 'active' : ''}`} />
);

const Wrapped: React.FC<Props> = (props: Props) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [stage, setStage] = useState<number>(0);
    const [wrappedData, setWrappedData] = useState({
        officeHourVisits: [],
        personalityType: "",
        timeHelpingStudents: 0,
        totalMinutes: 0
    });
    const [showBanner, setShowBanner] = useState(false);
    const totalStages = 5;

    useEffect(() => {

        const wrappedRef = firebase.firestore().collection('wrapped');
        // eslint-disable-next-line no-console
        const fetchData = async () => {
            setLoading(true);
            try {
                const doc = await wrappedRef.doc(props.user?.userId).get();
                if (doc.exists) {
                    setWrappedData(doc.data() as { 
                        officeHourVisits: never[]; 
                        personalityType: string; 
                        timeHelpingStudents: number; 
                        totalMinutes: number; 
                    });  
                } else {
                    // eslint-disable-next-line no-console
                    console.log('No such document!');
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Error fetching data: ", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [props.user]);

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
                <div style={{ 
                    position: "absolute",
                    top: "3rem",
                    left: "3rem",
                    width: "370px",
                    textAlign: "left",
                }}
                >
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
                            position: "absolute",
                            bottom: "11rem",
                            right: "8rem",
                            fontSize: "32rem",
                            color: "#F67D7D",
                            opacity: 0.6,
                            zIndex: 0,
                        }}
                    >
                        {wrappedData.officeHourVisits.length} 
                    </div>
                    <div 
                        style={{ 
                            position: "absolute",
                            bottom: "8rem",
                            right: "5rem",
                            fontWeight: "bold", 
                            width: "300px",
                            zIndex: 1,
                        }}
                    >
                        <Typography variant="h3"> 
                            YOU VISITED OFFICE HOURS {wrappedData.officeHourVisits.length} 
                            {wrappedData.officeHourVisits.length === 1 ? "TIME" : "TIMES" }
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    )

    const TimeSpent: React.FC = () => (
        <>
            <Typography variant="h2" style={{ fontWeight: "bold" }}> 
                YOU SPENT {wrappedData.totalMinutes} MINUTES AT OFFICE HOURS
            </Typography>
        </>
    )

    const PersonalityType: React.FC = () => (
        <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
                <Typography variant="h3" style={{ fontWeight: "bold" }}> 
                    Your office hour personality type is 
                    <div className="personalityType">{wrappedData.personalityType}</div>
                </Typography>
                {wrappedData.personalityType === "Consistent" ? 
                    <img 
                        src={ConsistentPersonality} 
                        className="personalityIcon" 
                        alt="Consistent Personality" 
                    /> : null
                }
                {wrappedData.personalityType === "Resourceful" ? 
                    <img 
                        src={ResourcefulPersonality} 
                        className="personalityIcon" 
                        alt="Resourceful Personality" 
                    /> : null
                }
                {wrappedData.personalityType === "Independent" ? 
                    <img 
                        src={IndependentPersonality}
                        className="personalityIcon" 
                        alt="Consistent Personality" 
                    /> : null
                }
                            
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
                {loading && <div>Loading...</div>}
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