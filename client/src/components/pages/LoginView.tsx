import * as React from 'react';
const QMeLogo = require('../../media/QMeLogo.svg');
const QLogo = require('../../media/QLogo.svg');
import LoginButton from '../includes/LoginButton';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_USER = gql`
query {
    apiGetCurrentUser
}
`;

class LoginView extends React.Component {
    render() {
        return (
            <Query query={GET_USER}>
                {({ loading, error, data }) => {
                    if (loading) {
                        return 'Loading...';
                    }
                    if (error) {
                        return `Error! ${error.message}`;
                    }

                    return (<div className="LoginView">
                        <section className="topPanel">
                            <img src={QMeLogo} className="QMeLogo" />
                            Queue up for office hours remotely. <br /> Skip the wait line
                            </section>
                        <section className="bottomPanel">
                            <p className="hintText" >Use your Cornell NetID to login</p>
                            <LoginButton URL="/__auth" />
                            <img src={QLogo} className="QLogo" />
                            <p>data.apiGetCurrentUser</p>
                        </section>
                    </div >);
                }}
            </Query>
        );
    }
}

export default LoginView;
