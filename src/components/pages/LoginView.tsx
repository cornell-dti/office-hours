import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

import firebase from 'firebase';
import QMeLogo from '../../media/QLogo2.svg';
import googleLogo from '../../media/googleLogo.svg';

import { userUpload } from '../../firefunctions';

const LoginView: React.FC = () => {
    const [showContact, setShowContact] = React.useState(false);
    const history = useHistory();

    const auth = () => {
        const authProvider = new firebase.auth.GoogleAuthProvider();
        authProvider.setCustomParameters({
            'hd': 'cornell.edu'
        });
        authProvider.addScope('email');
        authProvider.addScope('profile');

        return firebase.app().auth().signInWithPopup(authProvider).then((response) => {
            const user = response.user;
            userUpload(user);
            history.push('/');
        });
    };

    if (showContact) {
        return (
            <div className="LoginView contact">
                <section className="topPanel contact">
                    <button type="button" className="x" onClick={() => setShowContact(false)}>
                        <Icon name="x" />
                    </button>
                    <img src={QMeLogo} className="QMeLogo" alt="Queue Me In Logo" />
                    <h2>So, you want to use Queue Me In for your students?</h2>
                    <p>Let us know what class you are part of and we can set your class up!</p>
                </section>
                <section className="bottomPanel contact">
                    <a
                        className="contactButton"
                        href="mailto:queuemein@cornelldti.org?Subject=Queue%20Me%20In%20For%20Students"
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
                <img src={QMeLogo} className="QMeLogo" alt="Queue Me In Logo" />
                Office Hours Simplified
                <button type="button" className="contactText" onClick={() => setShowContact(true)}>
                    Interested in using Queue Me In for<br />your students?
                </button>
            </section>
            <section className="bottomPanel">
                <p className="hintText" >Use your Cornell NetID to login</p>
                <button type="button" className="loginButton" onClick={auth}>
                    <img src={googleLogo} className="googleLogo" alt="Google Login Logo" />
                    <span className="loginButtonText">Sign in with Google</span>
                </button>
            </section>
        </div >
    );
};

export default LoginView;
