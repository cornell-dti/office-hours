import * as React from 'react';
import { Icon } from 'semantic-ui-react';

import firebase, { app, firestore } from '../../firebase';
import { useHistory } from 'react-router-dom';
import { userUpload } from '../../firebasefunctions';

const QMeLogo = require('../../media/QLogo2.svg');
const googleLogo = require('../../media/googleLogo.svg');

const LoginView: React.FC = () => {
    const [showContact, setShowContact] = React.useState(false);
    let history = useHistory();

    const auth = () => {
        const authProvider = new firebase.auth.GoogleAuthProvider();
        authProvider.setCustomParameters({
            'hd': 'cornell.edu'
        });
        authProvider.addScope('email');
        authProvider.addScope('profile');

        return app.auth().signInWithPopup(authProvider).then((response) => {
            var user = response.user;
            userUpload(user, firestore);
            history.push('/');
        });
    };

    if (showContact) {
        return (
            <div className="LoginView"> >
                <section className="topPanel contact">
                    <button className="x" onClick={() => setShowContact(false)}>
                        <Icon name="x" />
                    </button>
                    <img src={QMeLogo} className="QMeLogo" />
                    <h2>So, you want to use Queue Me In for your students?</h2>
                    <p>Let us know what class you are part of and we can set your class up!</p>
                </section>
                <section className="bottomPanel contact">
                    <a
                        className="contactButton"
                        href="mailto:queuemein@gmail.com?Subject=Queue%20Me%20In%20For%20Students"
                    >
                        Contact Us
                    </a>
                </section>
            </div>
        );
    }

    return (
        <div className="LoginView">
            <section className="topPanel">
                <img src={QMeLogo} className="QMeLogo" />
                Office Hours Simplified
                        <button className="contactText" onClick={() => setShowContact(true)}>
                    Interested in using Queue Me In for<br />your students?
                        </button>
            </section>
            <section className="bottomPanel">
                <p className="hintText" >Use your Cornell NetID to login</p>
                <a className="loginButton" onClick={auth}>
                    <img src={googleLogo} className="googleLogo" />
                    <span className="loginButtonText">Sign in with Google</span>
                </a>
            </section>
        </div >
    );
};

export default LoginView;
