import * as React from 'react';
const QMeLogo = require('../../media/QLogo2.svg');
const googleLogo = require('../../media/googleLogo.svg');

class LoginView extends React.Component {
    render() {
        return (
            <div className="LoginView">
                <section className="topPanel">
                    <img src={QMeLogo} className="QMeLogo" />
                    The answer to all your office hour Q's
                </section>
                <section className="bottomPanel">
                    <p className="hintText" >Use your Cornell NetID to login</p>
                    <a className="loginButton" href="/__auth" >
                        <img src={googleLogo} className="googleLogo" />
                        <span className="loginButtonText">Sign in with Google</span>
                    </a>
                </section>
            </div >
        );
    }
}

export default LoginView;
