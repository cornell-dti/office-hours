import * as React from 'react';
import GoogleLogin from 'react-google-login';

class LoginView extends React.Component {
  printResponse = (response: ReactGoogleLogin.GoogleLoginResponseOffline) => {
    console.log(response.code);
  }

  printError = (response: {error: string}) => {
    console.log(response.error);
  }

  render() {
    return (
      <div className="LoginView">
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
