import * as React from 'react';
const QMeLogo = require('../../media/QMeLogo.svg');
const QLogo = require('../../media/QLogo.svg');
import LoginButton from '../includes/LoginButton';

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

const QMeLogoStyle: {} = {
  display: 'block',
  paddingBottom: '40px'
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
        <LoginButton domain="http://localhost:3001" />
        <img src={QLogo} style={QLogoStyle} />
      </div >
    );
  }
}

export default LoginView;
