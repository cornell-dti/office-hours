import * as React from 'react';
const QMeLogo = require('../../media/QMeLogo.svg');
const QLogo = require('../../media/QLogo.svg');
import LoginButton from '../includes/LoginButton';

class LoginView extends React.Component {
    render() {
        return (
            <div className="LoginView">
                <section className="topPanel">
                    <img src={QMeLogo} className="QMeLogo" />
                    the answer to all your office hour q's
                </section>
                <section className="bottomPanel">
                    <p className="hintText" >Use your Cornell NetID to login</p>
                    <LoginButton URL="/__auth" />
                    <img src={QLogo} className="QLogo" />
                </section>
            </div >
        );
    }
}

export default LoginView;
