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
                    Queue up for office hours remotely. <br /> Skip the wait line
        </section>
                <p className="hintText" >Use your Cornell NetID to login</p>
                <LoginButton URL="/__auth" />
                <img src={QLogo} className="QLogo" />
            </div >
        );
    }
}

export default LoginView;
