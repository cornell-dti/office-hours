import * as React from 'react';
import { useHistory } from 'react-router-dom';

import firebase, { app, firestore } from '../../firebase';
import { userUpload } from '../../firebasefunctions';

import QMILogo2020 from '../../media/QMILogo2020.svg'
import QMIPeople from '../../media/QMIPeople.gif';
import googleLogo from '../../media/googleLogo.svg';
import Demo from '../../media/Demo.png';
import WhiteStrip from '../../media/white_strip.svg';
import Footer from '../includes/Footer';

import Ask from '../../media/ask_a_question.svg';
import Reserve from '../../media/reserve.svg';
import Wait from '../../media/wait_turn.svg';

import Schedule from '../../media/schedule_hours.svg';
import Review from '../../media/host_review.svg';
import Analytics from '../../media/analytics.svg';

import QMIThreePeople from '../../media/ppl_illustration.svg';

const LoginView: React.FC = () => {
    const history = useHistory();

    const auth = () => {
        const authProvider = new firebase.auth.GoogleAuthProvider();
        authProvider.setCustomParameters({
            'hd': 'cornell.edu'
        });
        authProvider.addScope('email');
        authProvider.addScope('profile');

        return app.auth().signInWithPopup(authProvider).then((response) => {
            const user = response.user;
            userUpload(user, firestore);
            history.push('/');
        });
    };

    return (
        <div className="LoginView">
            <section className="header">
                <div className="logoWrapper">
                    <img src={QMILogo2020} className="QMINewLogo" alt="New QMI Logo" />
                    <h2 className="QMILogoText">Queue Me In</h2>
                </div>
                <a
                    className="contactButton" 
                    href="mailto:queuemein@cornelldti.org?Subject=Queue%20Me%20In%20For%20Students"
                >
                    Contact us
                </a>
            </section>
            <section className="mainInfo">
                <div className="nameAndButtonWrapper">
                    <h2 className="mainLogoText">Queue Me In</h2>
                    <h3 className="subHeader">Office Hours Simplified</h3>
                    <button type="button" className="loginButton" onClick={auth}>
                        <img src={googleLogo} className="googleLogo" alt="Google Login Logo" />
                        <span className="loginButtonText">Sign in with Google</span>
                    </button>
                </div>
                <img src={QMIPeople} className="QMIPeople" alt="People lining up" />
            </section>
            <div className="DemoWrapper">
                <img src={Demo} className="DemoQMI" alt="Demo of QMI" />
                <div className="ribbonWrapper">
                    <img src={WhiteStrip} className="whiteStrip" alt="" />
                    <div className="tutorialWrapper">
                        <h3 className="tutorialHeader">FOR STUDENTS</h3>
                        <div className="cardWrapper">
                            <div className="infoCard">
                                <img src={Ask} className="cardImg" alt="" />
                                <p className="cardDesc">Ask a question</p>
                            </div>
                            <div className="infoCard">
                                <img src={Reserve} className="cardImg" alt="" />
                                <p className="cardDesc">Reserve a spot</p>
                            </div>
                            <div className="infoCard">
                                <img src={Wait} className="cardImg" alt="" />
                                <p className="cardDesc">Wait your turn</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="whiteSectionWrapper">
                <div className="tutorialWrapper professorsTutorialWrapper">
                    <h3 className="tutorialHeader">FOR PROFESSORS</h3>
                    <div className="cardWrapper">
                        <div className="infoCard">
                            <img src={Schedule} className="cardImg" alt="" />
                            <p className="cardDesc">{"Schedule office \nhours"}</p>
                        </div>
                        <div className="infoCard">
                            <img src={Review} className="cardImg" alt="" />
                            <p className="cardDesc">{"Host review \nsessions"}</p>
                        </div>
                        <div className="infoCard">
                            <img src={Analytics} className="cardImg" alt="" />
                            <p className="cardDesc">{"View office hours \nanalytics"}</p>
                        </div>
                    </div>
                </div>
                <section className="finalTextSection">
                    <img className="qmiThreePeople" src={QMIThreePeople} alt="" />
                    <div className="finalTextWrapper">
                        <h2 className="finalText finalTextHead">Simplify office hours.</h2>
                        <h2 className="finalText finalTextBody">{"Manage the wave \nof students."}</h2>
                        <a
                            className="contactButton" 
                            href="mailto:queuemein@cornelldti.org?Subject=Queue%20Me%20In%20For%20Students"
                        >
                        Contact us
                        </a>
                    </div>
                </section>
                <Footer />
            </div>
            
        </div >
    );
};

export default LoginView;
