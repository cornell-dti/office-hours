import * as React from 'react';
import * as firebase from 'firebase';
import QMeLogo from '../../media/QLogo2.svg';
import googleLogo from '../../media/googleLogo.svg';
import { useAuth } from '../../firestoreHooks';

const LoginView = () => {
    const signin = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    };

    useAuth();

    return (
        <div className="LoginView">
            <section className="topPanel">
                <img src={QMeLogo} className="QMeLogo" alt="Queue Me In" />
                Office Hours Simplified
            </section>
            <section className="bottomPanel">
                <p className="hintText">Use your Cornell NetID to login</p>
                <button className="loginButton" onClick={signin} type="button">
                    <img src={googleLogo} className="googleLogo" alt="Login With Google" />
                    <span className="loginButtonText">Sign in with Google</span>
                </button>
            </section>
        </div>
    );
};
export default LoginView;
