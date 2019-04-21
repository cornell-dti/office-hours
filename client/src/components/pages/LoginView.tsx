import * as React from 'react';
import { Icon } from 'semantic-ui-react';
const QMeLogo = require('../../media/QLogo2.svg');
const googleLogo = require('../../media/googleLogo.svg');

class LoginView extends React.Component {

    state: {
        showContact: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            showContact: false
        };
    }

    render() {
        let isContact = this.state.showContact ? ' contact' : '';

        return (
            <div className={'LoginView' + isContact}>
                {!this.state.showContact && <React.Fragment>
                    <section className="topPanel">
                        <img src={QMeLogo} className="QMeLogo" />
                        Office Hours Simplified
                        <button className="contactText" onClick={() => this.setState({ showContact: true })}>
                            Interested in using Queue Me In for<br />your students?
                        </button>
                    </section>
                    <section className="bottomPanel">
                        <p className="hintText" >Use your Cornell NetID to login</p>
                        <a className="loginButton" href="/__auth" >
                            <img src={googleLogo} className="googleLogo" />
                            <span className="loginButtonText">Sign in with Google</span>
                        </a>
                    </section>
                </React.Fragment>
                }

                {this.state.showContact && <React.Fragment>
                    <section className={'topPanel' + isContact}>
                        <button className="x" onClick={() => this.setState({ showContact: false })}>
                            <Icon name="x" />
                        </button>
                        <img src={QMeLogo} className="QMeLogo" />
                        <h2>So, you want to use Queue Me In for your students?</h2>
                        <p>Let us know what class you are part of and we can set your class up!</p>
                    </section>
                    <section className={'bottomPanel' + isContact}>
                        <a
                            className="contactButton"
                            href="mailto:queuemein@gmail.com?Subject=Queue%20Me%20In%20For%20Students"
                        >
                            Contact Us
                        </a>
                    </section>
                </React.Fragment>
                }
            </div >
        );
    }
}

export default LoginView;
