import * as React from 'react';
import GoogleLogin from 'react-google-login';
const googleLogo = require('../../media/googleLogo.svg');
const QMeLogo = require('../../media/QMeLogo.svg');
const QLogo = require('../../media/QLogo.svg');

const topStyle: {} = {
  color: 'white',
  height: '45vh',
  fontSize: '18px',
  lineHeight: '1.4',
  backgroundImage: 'linear-gradient(-46deg, #668AE9 0%, #6DB9EA 100%)',
  marginBottom: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};

const hintText: {} = {
  color: 'grey'
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
};

const QMeLogoStyle: {} = {
  display: 'block',
  paddingBottom: '40px'
};

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

const QLogoStyle: {} = {
  bottom: '20px',
  position: 'absolute',
  marginLeft: 'auto',
  marginRight: 'auto',
  left: 0,
  right: 0
};

class LoginView extends React.Component {
  printResponse = (response: ReactGoogleLogin.GoogleLoginResponseOffline) => {
    console.log(response.code);
  }

  printError = (response: { error: string }) => {
    console.log(response.error);
  }

  render() {
    return (
      <div className="LoginView">
        <section style={topStyle}>
          <img src={QMeLogo} style={QMeLogoStyle} />
          Queue up for office hours remotely. <br /> Skip the wait line
        </section>
        <p style={hintText} >Use your Cornell NetID to login</p>
        <GoogleLogin
          hostedDomain="cornell.edu"
          clientId="694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com"
          onSuccess={this.printResponse}
          onFailure={this.printError}
          responseType="code"
          style={btnStyle}
          prompt=""
        >
          <img src={googleLogo} style={googleLogoStyle} />
          <span style={textStyle}>Sign in with Google</span>
        </GoogleLogin>
        <img src={QLogo} style={QLogoStyle} />
      </div >
    );
  }
}

export default LoginView;
