/* eslint-disable no-console */
/** Modal component for QMI Wrapped */

import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import "../../styles/Wrapped.scss";
import "../../styles/WrappedAnimation.scss";
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
import smallGirl from "../../media/wrapped/small_girl.svg";
import ConsistentPersonality from "../../media/wrapped/consistent_personality.svg";
import ResourcefulPersonality from "../../media/wrapped/resourceful_personality.svg";
import IndependentPersonality from "../../media/wrapped/independent_personality.svg";

import N0 from "../../media/wrapped/0-0.svg";
import N1 from "../../media/wrapped/0-1.svg";
import N2 from "../../media/wrapped/0-2.svg";
import N3 from "../../media/wrapped/0-3.svg";
import N4 from "../../media/wrapped/0-4.svg";
import N5 from "../../media/wrapped/0-5.svg";
import N6 from "../../media/wrapped/0-6.svg";
import N7 from "../../media/wrapped/0-7.svg";
import N8 from "../../media/wrapped/0-8.svg";
import N9 from "../../media/wrapped/0-9.svg";

import F0 from "../../media/wrapped/1-0.svg";
import F1 from "../../media/wrapped/1-1.svg";
import F2 from "../../media/wrapped/1-2.svg";
import F3 from "../../media/wrapped/1-3.svg";
import F4 from "../../media/wrapped/1-4.svg";
import F5 from "../../media/wrapped/1-5.svg";
import F6 from "../../media/wrapped/1-6.svg";
import F7 from "../../media/wrapped/1-7.svg";
import F8 from "../../media/wrapped/1-8.svg";
import F9 from "../../media/wrapped/1-9.svg";

import S0 from "../../media/wrapped/2-0.svg";
import S1 from "../../media/wrapped/2-1.svg";
import S2 from "../../media/wrapped/2-2.svg";
import S3 from "../../media/wrapped/2-3.svg";
import S4 from "../../media/wrapped/2-4.svg";
import S5 from "../../media/wrapped/2-5.svg";
import S6 from "../../media/wrapped/2-6.svg";
import S7 from "../../media/wrapped/2-7.svg";
import S8 from "../../media/wrapped/2-8.svg";
import S9 from "../../media/wrapped/2-9.svg";

import L0 from "../../media/wrapped/L-0.svg";
import L1 from "../../media/wrapped/L-1.svg";
import L2 from "../../media/wrapped/L-2.svg";
import L3 from "../../media/wrapped/L-3.svg";
import L4 from "../../media/wrapped/L-4.svg";
import L5 from "../../media/wrapped/L-5.svg";
import L6 from "../../media/wrapped/L-6.svg";
import L7 from "../../media/wrapped/L-7.svg";
import L8 from "../../media/wrapped/L-8.svg";
import L9 from "../../media/wrapped/L-9.svg";

import fiveDigits from "../../media/wrapped/five_digits.svg";
import arrow from '../../media/wrapped/arrow.svg';
import smallPlus from '../../media/wrapped/plus.svg';
import bigPlus from '../../media/wrapped/plus2.svg';

type Props = {
    user: FireUser | undefined;
    onClose: () => void;
};

type DotProps = {
    active: boolean;
    onClick: () => void;
};

type DotIndicatorProps = {
    showDots: string
}

  
const Dot = ({ active, onClick } : DotProps) => (
    <div className={`dot ${active ? 'active' : ''}`} onClick={onClick}/>
);

const Wrapped= (props: Props): JSX.Element => {
    const [loading, setLoading] = useState<boolean>(true);
    const [stage, setStage] = useState<number>(0);
    const [wrappedData, setWrappedData] = useState({
        officeHourVisits: [],
        personalityType: "",
        timeHelpingStudents: 0,
        totalMinutes: 0,
        favTaId: "",
        favClass:"",
        favDay: 0,
        favMonth: 0,
        numStudentsHelped: 0,
    });

    const [displayFavs, setDisplayFavs] = useState(true);
    const [role, setRole] = useState(0); // 0 === student, 1 === student/TA, 2 === TA

    const [taName, setTaName] = useState({
        firstName: "",
        lastName: "",
    });

    const [favClass, setFavClass] = useState({
        code: "",
    });


    const [totalStages, setTotalStages] = useState<number>(0);

    // add these to useEffect?
    const semester =  "FALL 2024";
    const months : string[] = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ]
    const days : string[] = [
        "SUNDAYS", "MONDAYS", "TUESDAYS", "WEDNESDAYS", "THURSDAYS", "FRIDAYS", "SATURDAYS"
    ]
    const month : string = months[wrappedData.favMonth];
    const day : string = days[wrappedData.favDay];


    const Asterik = () => (
        <img style={{paddingLeft: "45px", paddingRight: "45px"}} src={asterik} alt=""/>
    );

    const [showBanner, setShowBanner] = useState(false);

    /* TA's only see 4 slides, TA + Student see 7, Only student see 6 */  

    const RenderStudent = () => {
        if (displayFavs) {
            return (
                <>
                    {stage === 1 && <Visits />}
                    {stage === 2 && <TimeSpent />}
                    {stage === 3 && <PersonalityType />}
                    {stage === 4 && <FavTA/> }
                    {stage === 5 && <Conclusion />}
                </>
            )
        } 
        return (
            <>
                {stage === 1 && <Visits />}
                {stage === 2 && <TimeSpent />}
                {stage === 3 && <PersonalityType />}
                {stage === 4 && <Conclusion />}
            </>
        )
        
    }

    const RenderTA = () => (
        <>
            {stage === 1 && <TATimeHelped/>}
            {stage === 2 && <TAStudentsHelped/>}
            {stage === 3 && <Conclusion />}
        </>
    )

    const RenderStudentTA = () => {
        if (displayFavs) {
            return (
                <>
                    {stage === 1 && <Visits />}
                    {stage === 2 && <TimeSpent />}
                    {stage === 3 && <PersonalityType />}
                    {stage === 4 && <FavTA/>}
                    {stage === 5 && <TATimeHelped/>}
                    {stage === 6 && <Conclusion />}
                </>
            )
        } 
        return (
            <>
                {stage === 1 && <Visits />}
                {stage === 2 && <TimeSpent />}
                {stage === 3 && <PersonalityType />}
                {stage === 4 && <TATimeHelped/>}
                {stage === 5 && <Conclusion />}
            </>
        )
        
    };

    useEffect(() => {
        // add usestate for totalstages calculate it in useEffect
        setLoading(true);

        const wrappedRef = firebase.firestore().collection('wrapped');
        const fetchData = async () => {
            
            try {
                const doc = await wrappedRef.doc(props.user?.userId).get();
                const usersRef = firebase.firestore().collection('users');
                if (doc.exists) {
                    const studentData = doc.data() as { 
                        officeHourVisits: never[]; 
                        personalityType: string; 
                        timeHelpingStudents: number; 
                        totalMinutes: number; 
                        favTaId: string;
                        favClass: string;
                        favDay: number;
                        favMonth: number;
                        numStudentsHelped: number;
                    }
                    setWrappedData(studentData);  

                    const data = doc.data();
                    let numStages = 0;
                    if (data !== undefined) {
                        if (data.timeHelpingStudents === undefined || data.timeHelpingStudents === 0){
                            numStages = 6;
                            setRole(0);
                        } else if (data.favTaId === "" || data.favTaId === undefined){
                            numStages = 4;
                            setRole(2);
                        } else{
                            numStages = 7;
                            setRole(1);
                        }
                    }

                    const userDoc = await usersRef.doc(wrappedData.favTaId).get();
                    let taNameExists = false;
                    if (userDoc.exists) {
                        setTaName(userDoc.data() as { 
                            firstName: string;
                            lastName: string;
                        });  
                        taNameExists = true;
                    } else {
                        // eslint-disable-next-line no-console
                        console.log('No such document!');
                    }

                    if (studentData.favClass === "" || 
                        studentData.favDay === -1 || 
                        studentData.favTaId === "" || 
                        !taNameExists
                    ) {
                        setDisplayFavs(false);
                        numStages--;
                    } 

                    setTotalStages(numStages);

                    const coursesRef = firebase.firestore().collection("courses");

                    const coursesDoc = await coursesRef.doc(wrappedData.favClass).get();
                    if (coursesDoc.exists){
                        setFavClass(coursesDoc.data() as {
                            code: string;
                        })
                    } else{
                        // eslint-disable-next-line no-console
                        console.log('No such document!');
                    }  
                } else {
                    // eslint-disable-next-line no-console
                    console.log('No such document!');
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Error fetching data: ", error);
            }
            
        };

        fetchData();

        setLoading(false);
    }, [props.user, wrappedData.favClass, wrappedData.favTaId]);

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

    const DotsIndicator = ({showDots} : DotIndicatorProps) => (
        
        <div className={"dotsContainer" + showDots}>
            {[...Array(totalStages)].map((_, index) => ( 
                <Dot active={index === stage} onClick={() => setStage(index)}/>
            ))}
        </div>
    );

    const handleAnimationEnd = () => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); 
        return () => clearTimeout(timer);
    }

    const WrappedAnimationModal = () =>
        (                 
            <div className='qmi-container'>
                                
                {/* creates first red svg circle. need linear gradient tags here 
              since didn't import this svg.
              make note that width and height are basically the box containing the circle,
              so they need to be double the radius
              */}
                <svg className="red-circle" width="300" height="300">
                    {/* this creates the color gradients on the qmi logo */}
                    <defs>
                        <linearGradient 
                            id="red-gradient" 
                            x1="24.4251" 
                            y1="-52.6352" 
                            x2="112.279" 
                            y2="143.659" 
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FF9399" />
                            <stop offset="1" stopColor="#FF5A60" />
                        </linearGradient>
                    </defs>
                                    
                    {/* this is the actual circle part. 
                                    cx and cy are centers so shld be half of height/width. r is radius */}
                    <circle cx='150' cy='150' r='115'> </circle>
                </svg>
                <svg className="blue-circle" width="400" height="400">
                    <defs>
                        <linearGradient 
                            id="blue-gradient" 
                            x1="36.7649" 
                            y1="66.8832" 
                            x2="134.326" 
                            y2="192.278" 
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#B2D9FF" />
                            <stop offset="1" stopColor="#78B6F4" />
                        </linearGradient>
                    </defs>
                    <circle cx='200' cy='200' r='180'> </circle>
                </svg>
                {/* imported way of using svgs, so cant adjust stroke colors */}
                <img src={arrow} className="arrow-circle" alt="dti arrow" />
                {/* made two pluses since color gradient changes and second one needs
               to expand outside of the container. */}
                <img src={smallPlus} className="first-plus" alt="first plus" />
                <img
                    src={bigPlus}
                    className="sec-plus"
                    alt="second plus"
                    onAnimationEnd={handleAnimationEnd}
                />
                
            </div>
        )
      

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
            {favClass.code} ON {day} <Asterik />
            {favClass.code} ON {day} <Asterik />
            {favClass.code} ON {day} <Asterik />
            {favClass.code} ON {day} <Asterik />
        </div>
    );

    const StudentsHelpedBanner = () => (
        <div> 
            <Asterik/>
            YOU HAD THE MOST VISITS IN {month} <Asterik/>
            YOU HAD THE MOST VISITS IN {month} <Asterik/>
        </div>
    );

    const ConclusionBanner = () => (
        <div>
            <Asterik/> <span style={{ paddingRight: "100px"}}>SEE YOU SOON</span>
        </div>
    );

    const L = [L0, L1, L2, L3, L4, L5, L6, L7, L8, L9];
    const F = [F0, F1, F2, F3, F4, F5, F6, F7, F8, F9];
    const S = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9];
    const N = [N0, N1, N2, N3, N4, N5, N6, N7, N8, N9];

    const NumberPeople = () => {
        const digits = wrappedData.totalMinutes.toString().split('');
        const length = digits.length;
        const getSvgImage = (index :number, digit: number) => {
            switch (length) {
                case 1:
                    // Use 'L' for single digit numbers
                    return L[digit];
                case 2:
                    // 'F' for the first and 'L' for the last
                    return index === 0 ? N[digit] : L[digit]; 
                case 3:
                    if (index === 0) return F[digit];
                    if (index === 2) return L[digit];
                    return N[digit]; // 'N' for the middle digit
                case 4:
                    // 'S' for the second
                    if (index === 1) return S[digit];
                    // 'L' for the last
                    if (index === 3) return L[digit]; 
                    // 'N' for first and third
                    return N[digit]; 
                default:
                    return '';
                    // Default to '' if more than four digits, case handled outside
            }
        };

        if (length >= 5) {
            return (
                <div className="timeSpent five-nums">
                    <img src={fiveDigits} alt="Five digits" />
                </div>
            );
        }

        return (
            <div className="timeSpent nums-container">
                {digits.map((digit, index) => {
                    const SvgImage = getSvgImage(index, parseInt(digit, 10));
                    return <img key={digit} src={SvgImage} alt="" />;
                })}
            </div>
        );
    };

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
            <div>
                <NumberPeople/>
            </div>
            <div className="timeSpent minutes-text"> 
                MINUTES
            </div>
            <div className="timeSpent bottom-text"> 
                AT OFFICE HOURS
            </div>

            <img
                src={smallGirl}
                className="timeSpent smallGirl"
                alt=""
            />

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
            <div className="personality">
                <div className="personality container">
                    <div className="personality text">
                    YOUR OFFICE HOUR PERSONALITY TYPE IS...
                    </div>
            
                    <Typography variant="h3" style={{ fontWeight: 600 }}>  
                        <div className="personality personalityType">{wrappedData.personalityType}</div>
                    </Typography>
                </div>
                {wrappedData.personalityType === "Consistent" ? 
                    <img 
                        src={ConsistentPersonality} 
                        className="personality personalityIcon" 
                        alt="Consistent Personality" 
                    /> : null
                }
                {wrappedData.personalityType === "Resourceful" ? 
                    <img 
                        src={ResourcefulPersonality} 
                        className="personality personalityIcon" 
                        alt="Resourceful Personality" 
                    /> : null
                }
                {wrappedData.personalityType === "Independent" ? 
                    <img 
                        src={IndependentPersonality}
                        className="personality personalityIcon" 
                        alt="Consistent Personality" 
                    /> : null
                }
                            
            </div>
        </> 
    )

    const FavTA = () => (
        <>
            <div className="favTA all">
                <div className="favTA container">
                    <div className="favTA top-text">
                    YOU SPENT THE MOST TIME WITH...
                    </div>
                
                    <Typography variant="h3" style={{ fontWeight: 600 }}>  
                        <div className="favTA taName">TA {taName.firstName} {taName.lastName}</div>
                    </Typography>
                </div>
                <img 
                    src={TA} 
                    className="favTA ta-img"
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
            <div className="timeHelped all">
                
                <div className="timeHelped format">
                    <div className="timeHelped top-text">
                        THANK YOU FOR ALL YOUR HARD WORK! 
                    </div>
                    <div className="timeHelped mid-text">
                        YOU SPENT...
                    </div>
                
                    <div className="timeHelped num">
                        {wrappedData.timeHelpingStudents}
                    </div>
                    <img 
                        src={Group}
                        className="timeHelped group"
                        alt=""
                    />
                    
                    <div className="timeHelped bottom-text">
                        {wrappedData.timeHelpingStudents === 1 ? "MINUTE " : "MINUTES " }
                            HELPING STUDENTS
                    </div>
                </div>
            </div>
        </div>
    )

    const TAStudentsHelped = () =>(
        <>
            <div className="taStudentsHelped top-text">
                YOU MADE LIFE EASIER FOR...
            </div>
            <div>
                <NumberPeople/>
            </div>
            <div className="taStudentsHelped students">
                STUDENTS
            </div>
            <div>
                {showBanner && (
                    <>
                        <div className="banner bottom-ta-helped">
                            <StudentsHelpedBanner />
                        </div>
                    </>
                )}
            </div>
            <img
                src={smallGirl}
                className="smallGirl"
                alt=""
            />
        </>
    )

    const Conclusion = () => (
        <>
            <div style={{ display: "flex", flexDirection: "column",}}>
                <div className="conclusionText top-text"> 
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
                {loading && <WrappedAnimationModal />}
                {stage !== 0 && 
                    <div 
                        className={`navigateStage${loading ? '':'Visible prev'}`} 
                        onClick={() => navigateStage('prev')}
                    > 
                        <ArrowBackIosIcon />
                    </div>
                }

                {stage === 0 && <Welcome />}    

                {role === 2 && <RenderTA />}
                {role === 0 && <RenderStudent/>}
                {role === 1 && <RenderStudentTA/>}
                
                <DotsIndicator showDots={loading ? "" : "Visible"} />

                {stage !== totalStages - 1 && 
                    <div 
                        className={`navigateStage${loading ? '':'Visible next'}`} 
                        onClick={() => navigateStage('next')}
                    >
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