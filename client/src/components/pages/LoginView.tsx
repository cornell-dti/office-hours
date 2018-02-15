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
          buttonText="Login"
          onSuccess={this.printResponse}
          onFailure={this.printError}
          hostedDomain="cornell.edu"
          responseType="code"
        />
      </div>
    );
  }
}

export default LoginView;
