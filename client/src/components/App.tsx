import * as React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import * as ReactGA from 'react-ga';
// import * as moment from 'moment';

import { auth, firestore } from '../firebase';

import LoginView from './pages/LoginView';
import ProfessorView from './pages/ProfessorView';
import SplitView from './pages/SplitView';
import ProfessorTagsView from './pages/ProfessorTagsView';
import ProfessorRoles from './pages/ProfessorRoles';
import ProfessorDashboardView from './pages/ProfessorDashboardView';
import ProfessorPeopleView from './pages/ProfessorPeopleView';
import { Analytics } from './includes/Analytics';
import { Loader } from 'semantic-ui-react';
import { userUpload } from '../firebasefunctions';

ReactGA.initialize('UA-123790900-1');

// RYAN_TOOD get sensible default instead of 5
const DEFAULT_COURSE_ID = String(window.localStorage.getItem('lastid') || 5);

// Since the type is unknown, we have to use the any type in the next two lines.
// tslint:disable-next-line: no-any
const PrivateRoute = ({ component, ...rest }: any) => {
    // RYAN_TODO fix this
    // Check if the course is active or not, if not redirect to default course
    // let startDate = moment(data.courseByCourseId.startDate, 'YYYY-MM-DD');
    // let endDate = moment(data.courseByCourseId.endDate, 'YYYY-MM-DD');
    // if (startDate && endDate && !moment().isBetween(startDate, endDate)) {
    //     return <Redirect to={{ pathname: '/course/' + DEFAULT_COURSE_ID }} />;
    // }

    // Show a loader or redirect based on current auth state
    // isLoggedIn STATES:
    // 0: Fetching currently logged in status
    // 1: Not logged in
    // 2: Logged in
    const [isLoggedIn, setIsLoggedIn] = React.useState(0);

    auth.onAuthStateChanged((user) => {
        user ? setIsLoggedIn(2) : setIsLoggedIn(1);
        userUpload(user, firestore);
    });

    if (isLoggedIn === 0) {
        return <Loader active={true} content={'Loading'} />;
    } else if (isLoggedIn === 2) {
        return (<Route {...rest} component={component} />);
    }

    return <Redirect to={{ pathname: '/login' }} />;
};

const App = ({ }) => (
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
                <PrivateRoute
                    path="/professor/course/:courseId"
                    component={ProfessorView}
                    exact={true}
                />
                <PrivateRoute
                    path="/course/:courseId/session/:sessionId/:page?"
                    component={SplitView}
                />
                <PrivateRoute
                    path="/course/:courseId"
                    component={SplitView}
                />
                <Redirect from="/" to={'/course/' + DEFAULT_COURSE_ID} />
            </Switch>
        </div>
    </Router>
);

export default App;
