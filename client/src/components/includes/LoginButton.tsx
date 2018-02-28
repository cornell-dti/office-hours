import * as React from 'react';
const googleLogo = require('../../media/googleLogo.svg');

const googleLogoStyle: {} = {
    float: 'left'
};

const textStyle: {} = {
    color: 'white',
    fontFamily: 'Roboto',
    width: '100%',
    display: 'block',
    paddingTop: '10px'
};

const btnStyle: {} = {
    backgroundImage: 'linear-gradient(-135deg, #6DB9EA 0%, #668AE9 100%)',
    boxShadow: '0 0 2px 0 rgba(0,0,0,0.12), 0 2px 2px 0 rgba(0,0,0,0.24)',
    borderRadius: '2px',
    padding: '1px',
    width: '247px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.17s cubic-bezier(0.4, 0.0, 0.2, 1)',
    display: 'block',
    margin: 'auto',
    height: '40px'
};

class LoginButton extends React.Component {

    props: {
        URL: string
    };

    render() {
        return (
            <a
                style={btnStyle}
                href={this.props.URL}
            >
                <img src={googleLogo} style={googleLogoStyle} />
                <span style={textStyle}>Sign in with Google</span>
            </a>
        );
    }
}

export default LoginButton;