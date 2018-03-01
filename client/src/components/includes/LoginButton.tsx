import * as React from 'react';
const googleLogo = require('../../media/googleLogo.svg');

class LoginButton extends React.Component {

    props: {
        URL: string
    };

    render() {
        return (
            <a className="loginButton" href={this.props.URL} >
                <img src={googleLogo} className="googleLogo" />
                <span className="loginButtonText">Sign in with Google</span>
            </a>
        );
    }
}

export default LoginButton;