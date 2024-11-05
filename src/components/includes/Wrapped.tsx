/** Modal component for QMI Wrapped */

import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import "../../styles/Wrapped.scss";
import React, { useEffect, useState } from "react";
import firebase from '../../firebase';
import Couple from "../../media/wrapped/couple.svg"
import Girl from "../../media/wrapped/girl.svg"
import Bus from "../../media/wrapped/bus.svg"
import Group from "../../media/wrapped/group.svg";
import TA from "../../media/wrapped/ta.svg";
import asterik from "../../media/wrapped/asterik.svg";
import head from "../../media/wrapped/head.svg";
import body from "../../media/wrapped/body.svg";
import arm from "../../media/wrapped/arm.svg";
import ConsistentPersonality from "../../media/wrapped/consistent_personality.svg"
import ResourcefulPersonality from "../../media/wrapped/resourceful_personality.svg"
import IndependentPersonality from "../../media/wrapped/independent_personality.svg"

type Props = {
    user: FireUser | undefined;
    onClose: () => void;
};

type DotProps = {
    active: boolean;
    onClick: () => void;
};
  
const Dot = ({ active, onClick } : DotProps) => (
    <div className={`dot ${active ? 'active' : ''}`} onClick={onClick}/>
);

const Wrapped = (props: Props) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [stage, setStage] = useState<number>(0);
    const [wrappedData, setWrappedData] = useState({
        officeHourVisits: [],
        personalityType: "",
        timeHelpingStudents: 0,
        totalMinutes: 0,
        favTaId: "",
        favClass:"",
    });
    const [taName, setTaName] = useState({
        firstName: "",
        lastName: "",
    });

    const semester =  "FALL 2024";
    const month = "FEBRUARY";
    const favClass = "CS 1110";
    const favDay = "FRIDAYS";

    const Asterik = () => (
        <img style={{paddingLeft: "45px", paddingRight: "45px"}} src={asterik} alt=""/>
    );

    const [showBanner, setShowBanner] = useState(false);

    /* TA's only see 4 slides, TA + Student see 7, Only student see 6 */  
    const totalStages = (wrappedData.timeHelpingStudents === undefined || wrappedData.timeHelpingStudents === 0) ? 
        (6) : (wrappedData.favTaId === "" || wrappedData.favTaId === undefined ) ? 4 : 7;

    const RenderStudent = () => {
        if (loading) return null;

        return (
            <>
                {stage === 1 && <Visits />}
                {stage === 2 && <TimeSpent />}
                {stage === 3 && <PersonalityType />}
                {stage === 4 && <FavTA/>}
                {stage === 5 && <Conclusion />}
            </>
        );
    };

    const RenderTA = () => (
        <>
            {stage === 1 && <TATimeHelped/>}
            {stage === 2 && <TAStudentsHelped/>}
            {stage === 3 && <Conclusion />}
        </>
    )

    const RenderStudentTA = () => {
        if (loading) return null;

        return(
            <>
                {stage === 1 && <Visits />}
                {stage === 2 && <TimeSpent />}
                {stage === 3 && <PersonalityType />}
                {stage === 4 && <FavTA/>}
                {stage === 5 && <TATimeHelped/>}
                {stage === 6 && <Conclusion />}
            </>
        );
    };

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
                        favTaId: string;
                        favClass: string;
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

        const usersRef = firebase.firestore().collection('users');
        // eslint-disable-next-line no-console
        const fetchData = async () => {
            setLoading(true);
            try {
                const doc = await usersRef.doc(wrappedData.favTaId).get();
                if (doc.exists) {
                    setTaName(doc.data() as { 
                        firstName: string;
                        lastName: string;
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
    }, [wrappedData.favTaId]);

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

    const DotsIndicator = () => (
        <div className="dotsContainer">
            {[...Array(totalStages)].map((_, index) => ( 
                <Dot active={index === stage} onClick={() => setStage(index)}/>
            ))}
        </div>
    );

    const WelcomeBanner = () => (
        <div>
            {semester} <Asterik/> {semester} <Asterik/> {semester} <Asterik/> {semester}
        </div>
    );

    const TimeSpentBanner = () => (
        <div>
            YOU SPENT THE MOST TIME AT OFFICE HOURS IN {month} <Asterik/> 
            YOU SPENT THE MOST TIME AT OFFICE HOURS IN {month} <Asterik/>
        </div>
    );

    const FavTABanner = () => (
        <div>
            {favClass} ON {favDay} <Asterik />
            {favClass} ON {favDay} <Asterik />
            {favClass} ON {favDay} <Asterik />
            {favClass} ON {favDay} <Asterik />
        </div>
    );

    const ConclusionBanner = () => (
        <div>
            <Asterik/> <span style={{ paddingRight: "100px"}}>SEE YOU SOON</span>
        </div>
    );

    const Welcome = () => (
        <div>
            <div className="welcomeSlide">
                <div style={{ alignSelf: "flex-start", width: "366px" }}>
                    <Typography variant="h2" style={{ fontWeight: 700 }}> Queue Me In</Typography>
                </div>
                <div style={{ alignSelf: "flex-end", width: "279px" }}>
                    <Typography variant="h2" style={{ fontWeight: 400 }}> WRAPPED</Typography>
                </div>
                <div className="animationContainer">
                    {showBanner && (
                        <>
                            <div className="banner top-right">
                                <WelcomeBanner />
                            </div>
                            <div className="banner bottom-left">
                                <WelcomeBanner />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )

    const Visits = () => (
        <div>
            <div className="visit">
                
                <div style={{ display: "flex", justifyContent: "flex-end", fontWeight: "bold" }}>
                    <div className="visit top-text">
                        YOU WORKED SO HARD THIS SEMESTER!
                    </div>
                    <div className="visit mid-text">
                        <Typography variant="h3"> 
                            WITH...
                        </Typography>
                    </div>
                    <div className="visit num-visits">
                        {wrappedData.officeHourVisits.length} 
                    </div>
                    <img 
                        src={Couple}
                        className="visit couple"
                        alt=""
                    />
                    <img 
                        src={Girl}
                        className="visit girl"
                        alt=""
                    />
                    <div 
                        className="visit bottom-text"
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

    const TimeSpent = () => (
        <>
            <div className="timeSpent top-text"> 
                SPENDING A TOTAL OF...
            </div>
            <div className="timeSpent num-text">
                {wrappedData.totalMinutes}
            </div>
            <div className="timeSpent minutes-text"> 
                MINUTES
            </div>
            <div className="timeSpent bottom-text"> 
                AT OFFICE HOURS
            </div>

            <div>
                {showBanner && (
                    <>
                        <div className="banner bottom-time">
                            <TimeSpentBanner />
                        </div>
                    </>
                )}
            </div>
        </>
    )

    const PersonalityType = () => (
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
                        textAlign: "left",
                    }}
                    >
                    YOUR OFFICE HOUR PERSONALITY TYPE IS...
                    </div>
                
                    <Typography variant="h3" style={{ fontWeight: 600 }}>  
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

    const FavTA = () => (
        <>
            <div style={{ 
                display: "flex", 
                position: "absolute", 
                top: "6rem", 
                alignItems: "center", 
                justifyContent: "space-evenly",
            }}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "337px",
                    height: "100%",
                    paddingLeft: "5%",
                }}
                >
                    <div style={{
                        fontWeight: "bold",
                        fontSize: "27px",
                        marginBottom: "2rem",
                        lineHeight: "2.5rem",
                        textAlign: "left",
                    }}
                    >
                    YOU SPENT THE MOST TIME WITH...
                    </div>
                
                    <Typography variant="h3" style={{ fontWeight: 600 }}>  
                        <div className="taName">TA {taName.firstName} {taName.lastName}</div>
                    </Typography>
                </div>
                <img 
                    src={TA} 
                    style={{
                        width: "323px",
                    }}
                    alt="" 
                />     
            </div>
            <div>
                {showBanner && (
                    <>
                        <div className="banner bottom-favta">
                            <FavTABanner />
                        </div>
                    </>
                )}
            </div>  
        </> 
    )

    const TATimeHelped = () => (
        <div>
            <div style={{ display: "flex", flexDirection: "column", width: "750px", justifyContent: "space-between" }}>
                
                <div style={{ display: "flex", justifyContent: "flex-end", fontWeight: "bold" }}>
                    <div style={{ 
                        position: "absolute",
                        top: "3rem",
                        left: "3rem",
                        fontSize: "30px",
                        color: "#080680",
                    }}
                    >
                        THANK YOU FOR ALL YOUR HARD WORK! 
                    </div>
                    <div style={{ 
                        position: "absolute",
                        top: "9rem",
                        left: "3rem",
                        fontWeight: 700, 
                        fontSize: "29px",
                    }}
                    > 
                        YOU SPENT...
                    </div>
                
                    <div 
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "420px",
                            transform: "translate(-50%, -50%)",
                            fontSize: "13rem",
                            color: "#F1A4AB",
                        }}
                    >
                        {wrappedData.timeHelpingStudents}
                    </div>
                    <img 
                        src={Group}
                        style={{ 
                            width: "305px", 
                            height: "239.6px",
                            position: "absolute", 
                            top:"17rem",
                            left: "2rem",
                        }}
                        alt=""
                    />
                    
                    <div 
                        style={{ 
                            position: "absolute",
                            top: "26rem",
                            right: "2rem",
                            fontWeight: 700, 
                            fontSize: "29px",
                            width: "414px",
                            textAlign: "right",
                        }}
                    >
                        {wrappedData.timeHelpingStudents == 1 ? "HOUR " : "HOURS " }
                            HELPING STUDENTS
                    </div>
                </div>
            </div>
        </div>
    )

    const TAStudentsHelped = () =>(
        <>
            <div style={{ 
                position: "absolute",
                top: "3rem",
                left: "3rem",
                fontWeight: "bold", 
                fontSize: "2.5rem",
            }}
            > 
                YOU MADE LIFE EASIER FOR...
            </div>
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "18rem",
                fontWeight: 600,
                color: "#080680",
            }}
            >
                70
                {/* replace with firebase call for num students helped */}
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
                STUDENTS
            </div>
        </>
    )

    const Conclusion = () => (
        <>
            <div style={{ display: "flex", flexDirection: "column",}}>
                <div 
                    style={{ 
                        color: "#080680", 
                        fontWeight: 600, 
                        position: "absolute", 
                        top: "3rem",
                        left: "3rem",
                        fontSize: "35px",
                    }}
                > 
                    PAT YOURSELF ON THE BACK
                </div>
                <div className="conclusionText center-text"> 
                    IT'S TIME FOR A WELL DESERVED BREAK!
                </div>
                <img 
                    src={Bus} 
                    className="bus"
                    alt="" 
                />
                <img 
                    src={arm}
                    className="arm"
                    alt=""
                />

                <img
                    src={head}
                    className="head"
                    alt=""
                />

                <img
                    src={body}
                    className="body"
                    alt=""
                />
            </div>
            <div>
                {showBanner && (
                    <>
                        <div className="banner bottom-conclusion">
                            <ConclusionBanner />
                        </div>
                    </>
                )}
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

                {totalStages === 4 && <RenderTA />}
                {totalStages === 6 && <RenderStudent/>}
                {totalStages === 7 && <RenderStudentTA/>}
                
                <DotsIndicator />

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