import * as React from 'react';
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
  display: 'block',
  margin: 'auto',
  height: '40px'
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
  render() {
    return (
      <div className="LoginView">
        <section style={topStyle}>
          <img src={QMeLogo} style={QMeLogoStyle} />
          Queue up for office hours remotely. <br /> Skip the wait line
        </section>
        <p style={hintText} >Use your Cornell NetID to login</p>
        <a
          style={btnStyle}
          href={
            'https://accounts.google.com/o/oauth2/auth?' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth' +
            '&response_type=code' +
            '&scope=email%20profile%20openid' +
            '&openid.realm=' +
            '&client_id=694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com' +
            '&ss_domain=http%3A%2F%2Flocalhost%3A3000' +
            '&prompt=' +
            '&fetch_basic_profile=true' +
            '&hd=cornell.edu' +
            '&gsiwebsdk=2'
          }
        >
          <img src={googleLogo} style={googleLogoStyle} />
          <span style={textStyle}>Sign in with Google</span>
        </a>
        <img src={QLogo} style={QLogoStyle} />
      </div >
    );
  }
}

export default LoginView;
