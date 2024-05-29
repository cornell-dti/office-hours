/** Modal component for QMI Wrapped */

import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import "../../styles/Wrapped.scss";
import React, { useEffect, useState } from "react";
import firebase from '../../firebase';
import Couple from "../../media/couple.svg"
import Girl from "../../media/girl.svg"
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
                
                <div style={{ display: "flex", justifyContent: "flex-end", fontWeight: "bold" }}>
                    <div style={{ 
                        position: "absolute",
                        top: "3rem",
                        left: "3rem",
                        fontSize: "2.5rem",
                        color: "#080680",
                    }}
                    >
                        YOU WORKED SO HARD THIS SEMESTER!
                    </div>
                    <div style={{ 
                        position: "absolute",
                        top: "8rem",
                        left: "3rem",
                    }}
                    >
                        <Typography variant="h3"> 
                            WITH...
                        </Typography>
                    </div>
                    <div 
                        style={{
                            position: "absolute",
                            bottom: "40%",
                            right: "50%",
                            fontSize: "24rem",
                            color: "#F67D7D",
                            opacity: 0.7,
                            zIndex: 0,
                        }}
                    >
                        {wrappedData.officeHourVisits.length} 
                    </div>
                    <img 
                        src={Couple}
                        style={{ 
                            width: "12rem", 
                            position: "absolute", 
                            right: "11rem", 
                            bottom: "12rem" 
                        }}
                        alt=""
                    />
                    <img 
                        src={Girl}
                        style={{ 
                            width: "6rem", 
                            position: "absolute", 
                            right: "6rem", 
                            bottom: "9rem" 
                        }}
                        alt=""
                    />
                    <div 
                        style={{ 
                            position: "absolute",
                            bottom: "5rem",
                            right: "4rem",
                            fontWeight: "bold", 
                            width: "300px",
                            textAlign: "left",
                        }}
                    >
                        <Typography variant="h3"> 
                            {wrappedData.officeHourVisits.length === 1 ? "VISIT " : "VISITS " }
                            TO OFFICE HOURS
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    )

    const TimeSpent: React.FC = () => (
        <>
            <div style={{ 
                position: "absolute",
                top: "3rem",
                left: "3rem",
                fontWeight: "bold", 
                fontSize: "2.5rem",
            }}
            > 
                SPENDING A TOTAL OF...
            </div>
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "18rem",
                color: "#080680",
            }}
            >
                {wrappedData.totalMinutes}
            </div>
            <div style={{ 
                position: "absolute",
                bottom: "8rem",
                right: "3rem",
                fontWeight: "bold", 
                fontSize: "2.5rem",
                textAlign: "right",
                width: "300px",
            }}
            > 
                MINUTES
            </div>
            <div style={{ 
                position: "absolute",
                bottom: "5rem",
                right: "3rem",
                fontWeight: "bold", 
                fontSize: "2.5rem",
                textAlign: "right",
                width: "300px",
            }}
            > 
                AT OFFICE HOURS
            </div>
        </>
    )

    const PersonalityType: React.FC = () => (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly",}}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "45%",
                }}
                >
                    <div style={{
                        fontWeight: "bold",
                        fontSize: "2rem",
                        marginBottom: "2rem",
                        lineHeight: "2.5rem",
                    }}
                    >
                    YOUR OFFICE HOUR PERSONALITY TYPE IS...
                    </div>
                
                    <Typography variant="h3" style={{ fontWeight: "bold" }}>  
                        <div className="personalityType">{wrappedData.personalityType}</div>
                    </Typography>
                </div>
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