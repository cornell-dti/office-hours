import * as React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import * as ReactGA from 'react-ga';

import LoginView from './pages/LoginView';
import ProfessorView from './pages/ProfessorView';
import SplitView from './pages/SplitView';
import ProfessorTagsView from './pages/ProfessorTagsView';
import ProfessorRoles from './pages/ProfessorRoles';
import ProfessorDashboardView from './pages/ProfessorDashboardView';
import ProfessorPeopleView from './pages/ProfessorPeopleView';
import { Analytics } from './includes/Analytics';
import { Loader } from 'semantic-ui-react';

ReactGA.initialize('UA-123790900-1');

var cookie = document.cookie;
var semi = /lastCourseId=\d; _ga=/m;
var semicolon = semi.exec(cookie);
var n = /lastCourseId=\d/m;
var shift = n.exec(String(semicolon));
var result = /\d/g.exec(String(shift));
var newCourseID = result && result[0] || 2;
console.log(semicolon);
console.log(result);
console.log(shift);

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
                    return <Loader active={true} content={'Loading'} />;
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
                    <Route path="/" component={Analytics} />
                    <Switch>
                        <Route path="/login" component={LoginView} />
                        <PrivateRoute
                            path="/professor-tags/course/:courseId"
                            component={ProfessorTagsView}
                            exact={true}
                        />
                        <PrivateRoute
                            path="/professor-people/course/:courseId"
                            component={ProfessorPeopleView}
                        />
                        <PrivateRoute
                            path="/professor-dashboard/course/:courseId"
                            component={ProfessorDashboardView}
                            exact={true}
                        />
                        <PrivateRoute
                            path="/professor-roles/course/:courseId"
                            component={ProfessorRoles}
                            exact={true}
                        />
                        <PrivateRoute path="/professor/course/:courseId" component={ProfessorView} exact={true} />
                        <PrivateRoute path="/course/:courseId/session/:sessionId/:page?" component={SplitView} />
                        <PrivateRoute path="/course/:courseId" component={SplitView} />
                        <Redirect from="/" to={'/course/' + newCourseID} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
