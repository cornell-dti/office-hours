import * as React from 'react';
const QMeLogo = require('../../media/QLogo2.svg');
const googleLogo = require('../../media/googleLogo.svg');
import { useAuth } from '../../firestoreHooks';
import * as firebase from 'firebase';

const LoginView = () => {
    const signin = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    };

    useAuth();

    return (
        <div className="LoginView">
            <section className="topPanel">
                <img src={QMeLogo} className="QMeLogo" />
                Office Hours Simplified
                </section>
            <section className="bottomPanel">
                <p className="hintText">Use your Cornell NetID to login</p>
                <button className="loginButton" onClick={signin}>
                    <img src={googleLogo} className="googleLogo" />
                    <span className="loginButtonText">Sign in with Google</span>
                </button>
            </section>
        </div>
    );
};
export default LoginView;
