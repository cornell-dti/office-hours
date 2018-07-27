import * as React from 'react';
import LoginView from './pages/LoginView';
import ProfessorView from './pages/ProfessorView';
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from 'react-router-dom';
import SplitView from './pages/SplitView';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_USER = gql`
query {
    apiGetCurrentUser {
        nodes {
            userId
        }
    }
}
`;

interface Data {
    apiGetCurrentUser: {
        nodes: Array<{ userId: number }>;
    };
}

class UserQuery extends Query<Data, {}> { }

// Since the type is unknown, we have to use the any type in the next two lines.
// tslint:disable-next-line: no-any
const PrivateRoute = ({ component, ...rest }: any) => {
    // tslint:disable-next-line: no-any
    const routeComponent = (props: any) => (
        <UserQuery query={GET_USER} fetchPolicy="network-only">
            {({ loading, error, data }) => {
                if (loading) {
                    return 'Loading...';
                }
                if (error) {
                    return <Redirect to={{ pathname: '/login' }} />;
                }
                if (!data || data.apiGetCurrentUser.nodes.length === 0) {
                    return <Redirect to={{ pathname: '/login' }} />;
                }
                return React.createElement(component, props);
            }}
        </UserQuery>
    );
    return <Route {...rest} render={routeComponent} />;
};

class App extends React.Component {
    render() {
        return (
            <Router>
                <div className="App">
                    <nav>
                        <Link to="/login"> Login View</Link> |
                        <Link to="/professor"> Professor View</Link> |
                        <Link to="/course/1"> Split View</Link>
                    </nav>
                    <Switch>
                        <Route path="/login" component={LoginView} />
                        <PrivateRoute path="/course/:courseId/session/:sessionId/:page?" component={SplitView} />
                        <PrivateRoute path="/course/:courseId" component={SplitView} />
                        <PrivateRoute path="/professor" component={ProfessorView} />
                        <Redirect from="/" to="/course/1" />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
