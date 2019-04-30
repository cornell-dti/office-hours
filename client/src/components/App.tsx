import * as React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
// import gql from 'graphql-tag';
// import { Query } from 'react-apollo';
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
import { useAuth } from '../firestoreHooks';
// import { firestore } from './includes/firebase';
// import * as firebase from 'firebase/app';

ReactGA.initialize('UA-123790900-1');

// Since the type is unknown, we have to use the any type in the next two lines.
// tslint:disable-next-line: no-any
const PrivateRoute = ({ component, ...rest }: any) => {
    // tslint:disable-next-line: no-any
    const { initializing } = useAuth();

    const routeComponent = (props: {}) => {
        if (initializing) {
            return <Loader active={true} content={'Loading'} />;
        }

        return React.createElement(component, props);
    };
    return <Route {...rest} component={routeComponent} />;
};

const App = () => {
    return (
        <Router>
            <div className="App">
                <Route path="/" component={Analytics} />
                <Switch>
                    <Route path="/login" component={LoginView} />
                    <PrivateRoute path="/professor-tags/course/:courseId" component={ProfessorTagsView} exact={true} />
                    <PrivateRoute path="/professor-people/course/:courseId" component={ProfessorPeopleView} />
                    <PrivateRoute
                        path="/professor-dashboard/course/:courseId"
                        component={ProfessorDashboardView}
                        exact={true}
                    />
                    <PrivateRoute path="/professor-roles/course/:courseId" component={ProfessorRoles} exact={true} />
                    <PrivateRoute path="/professor/course/:courseId" component={ProfessorView} exact={true} />
                    <PrivateRoute path="/course/:courseId/session/:sessionId/:page?" component={SplitView} />
                    <PrivateRoute path="/course/:courseId" component={SplitView} />
                    <Redirect from="/" to={'/course/' + String(window.localStorage.getItem('lastid') || 2)} />

                </Switch>
            </div>
        </Router>
    );
};

export default App;
