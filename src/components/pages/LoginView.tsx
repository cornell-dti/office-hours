import * as React from 'react';
import { useHistory } from 'react-router-dom';

import firebase, { app, firestore } from '../../firebase';
import { userUpload } from '../../firebasefunctions/user';

import QMILogo2020 from '../../media/QMILogo2020.svg';
import QMIPeople from '../../media/QMIPeople.gif';
import googleLogo from '../../media/googleLogo.svg';
import Demo from '../../media/demo_higher_res.png';
import WhiteStrip from '../../media/white_strip.svg';
import SecondWhiteStrip from '../../media/second_white_strip.svg';
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
        if (
            process.env.NODE_ENV === 'production' &&
            process.env.REACT_APP_IS_STAGING !== 'true'
        ) {
            authProvider.setCustomParameters({
                hd: 'cornell.edu',
            });
        }
        authProvider.addScope('email');
        authProvider.addScope('profile');

        return app
            .auth()
            .signInWithPopup(authProvider)
            .then((response) => {
                const user = response.user;
                userUpload(user, firestore);
                history.push('/');
            });
    };

    const passAuth = () => {};

    return (
        <div className="loginView">
            <section className="header">
                <div className="logoWrapper">
                    <img
                        src={QMILogo2020}
                        className="qmiNewLogo"
                        alt="New QMI Logo"
                    />
                    <h2 className="qmiLogoText">Queue Me In</h2>
                </div>
                <a
                    className="qmiContact"
                    href="mailto:queuemein@cornelldti.org?Subject=Queue%20Me%20In%20For%20Students"
                >
                    Contact us
                </a>
            </section>
            <section className="mainInfo">
                <div className="nameAndButtonWrapper">
                    <h2 className="mainLogoText">Queue Me In</h2>
                    <h3 className="subHeader">Office Hours Simplified</h3>
                    <button
                        type="button"
                        className="loginButton"
                        onClick={auth}
                    >
                        <img
                            src={googleLogo}
                            className="googleLogo"
                            alt="Google logo"
                        />
                        <span className="loginButtonText">
                            Sign in with Google
                        </span>
                    </button>
                </div>
                <img
                    src={QMIPeople}
                    className="qmiPeople"
                    alt="People lining up"
                />
            </section>
            <div className="demoWrapper">
                <img src={Demo} className="demoQMI" alt="Demo of QMI" />
                <div className="ribbonWrapper">
                    <img
                        src={WhiteStrip}
                        className="whiteStrip"
                        alt="Curved background strip"
                    />
                    <h2 className="sloganText">
                        {
                            'Say goodbye to crowded and \nunorganized office hours.'
                        }
                    </h2>
                    <div className="bothTutorialsWrapper">
                        <div className="tutorialWrapper">
                            <h3 className="tutorialHeader">
                                {'For students who need \none-on-one support'}
                            </h3>
                            <div className="cardWrapper">
                                <div className="infoCard">
                                    <img
                                        src={Ask}
                                        className="cardImg"
                                        alt="Question bubble"
                                    />
                                    <p className="cardDesc">
                                        {
                                            'Ask questions in a \ndiscussion or queue'
                                        }
                                    </p>
                                </div>
                                <div className="infoCard">
                                    <img
                                        src={Reserve}
                                        className="cardImg"
                                        alt="Reserved"
                                    />
                                    <p className="cardDesc">
                                        {'Reserve time to speak \nwith a TA'}
                                    </p>
                                </div>
                                <div className="infoCard">
                                    <img
                                        src={Wait}
                                        className="cardImg"
                                        alt="Waiting in line"
                                    />
                                    <p className="cardDesc">
                                        {
                                            'Get your questions \nanswered by course staff'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="tutorialWrapper professorsTutorialWrapper">
                            <h3 className="tutorialHeader">
                                {
                                    'For professors looking to shape \ntheir teaching experience'
                                }
                            </h3>
                            <div className="cardWrapper">
                                <div className="infoCard">
                                    <img
                                        src={Schedule}
                                        className="cardImg"
                                        alt="Calendar"
                                    />
                                    <p className="cardDesc">
                                        {'Schedule your office \nhours easily'}
                                    </p>
                                </div>
                                <div className="infoCard">
                                    <img
                                        src={Review}
                                        className="cardImg"
                                        alt="Asking and answering questions"
                                    />
                                    <p className="cardDesc">
                                        {
                                            'Assign TAs to discussions \nor host yourself'
                                        }
                                    </p>
                                </div>
                                <div className="infoCard">
                                    <img
                                        src={Analytics}
                                        className="cardImg"
                                        alt="Bar graph"
                                    />
                                    <p className="cardDesc">
                                        {
                                            'View office hour and \ndiscussion analytics'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    src={SecondWhiteStrip}
                    className="secondWhiteStrip"
                    alt="Second curved background strip"
                />
            </div>

            <div className="whiteSectionWrapper">
                <section className="finalTextSection">
                    <img
                        className="qmiThreePeople"
                        src={QMIThreePeople}
                        alt="People walking"
                    />
                    <div className="finalTextWrapper">
                        <h2 className="finalText finalTextHead">
                            Simplify office hours.
                        </h2>
                        <h2 className="finalText finalTextBody">
                            {'Manage the wave \nof students.'}
                        </h2>
                        <a
                            className="qmiContact"
                            href="mailto:queuemein@cornelldti.org?Subject=Queue%20Me%20In%20For%20Students"
                        >
                            Contact us
                        </a>
                    </div>
                </section>
                <Footer />
            </div>
        </div>
    );
};

export default LoginView;
