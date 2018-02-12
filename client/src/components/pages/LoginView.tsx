import * as React from 'react';
import GoogleLogin from 'react-google-login';

class LoginView extends React.Component {
  responseGoogle = (response: ReactGoogleLogin.GoogleLoginResponse) => {
    console.log(response);
    console.log("Email: " + response.getBasicProfile().getEmail());
  }

  render() {
    return (
      <div className="LoginView">
        <GoogleLogin
          clientId="694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={this.responseGoogle}
          onFailure={this.responseGoogle}
          hostedDomain="cornell.edu"
        />
      </div>
    );
  }
}

export default LoginView;
