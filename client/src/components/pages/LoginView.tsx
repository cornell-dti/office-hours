import * as React from 'react';
import GoogleLogin from 'react-google-login';

const topStyle: any = {
  color: 'white',
  height: '50vh',
  fontSize: '18px',
  lineHeight: '1.4',
  backgroundImage: 'linear-gradient(-225deg, #6DB9EA 0%, #668AE9 100%)',
  marginBottom: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const hintText: any = {
  color: 'grey'
}

const btnStyle: any = {
  backgroundImage: 'linear-gradient(90deg, #83C5EA 0%, #5D89F0 100%)',
  boxShadow: '0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.20)',
  borderRadius: '4px',
  padding: '12px',
  width: '200px',
  fontSize: '16px',
  color: 'white',
  outline: 'none',
  transition: 'all 0.17s cubic-bezier(0.4, 0.0, 0.2, 1)',
}

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
          Queue up for office hours remotely. <br /> Skip the wait line
        </section>
        <p style={hintText} >Use your Cornell NetID to login</p>
        <GoogleLogin
          clientId="694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com"
          buttonText="Sign in with Google"
          onSuccess={this.printResponse}
          onFailure={this.printError}
          hostedDomain="cornell.edu"
          responseType="code"
          style={btnStyle}
        />
      </div>
    );
  }
}

export default LoginView;
