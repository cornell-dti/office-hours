import * as React from 'react';
import GoogleLogin from 'react-google-login';

class LoginView extends React.Component {
  responseGoogle = (response: Object) => {
    console.log(response);
    // console.log("Email: " + response.profileObj.email);
  }

  render() {
    return (
      <div className="LoginView">
        <GoogleLogin
          clientId="694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={this.responseGoogle}
          onFailure={this.responseGoogle}
        />
      </div>
    );
  }
}

export default LoginView;
