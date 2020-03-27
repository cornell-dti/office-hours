import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import * as ReactGA from 'react-ga';
import moment from 'moment';

import { auth, firestore } from '../firebase';

import LoginView from './pages/LoginView';
import ProfessorView from './pages/ProfessorView';
import SplitView from './pages/SplitView';
import ProfessorTagsView from './pages/ProfessorTagsView';
import ProfessorRoles from './pages/ProfessorRoles';
import ProfessorDashboardView from './pages/ProfessorDashboardView';
import ProfessorPeopleView from './pages/ProfessorPeopleView';
import CourseEditView from './pages/CourseEditView';
import CourseSelectionView from './pages/CourseSelectionView';
import { Analytics } from './includes/Analytics';
import { Loader } from 'semantic-ui-react';
import { userUpload } from '../firebasefunctions';
import { useMyUser, useAllCourses } from '../firehooks';

ReactGA.initialize('UA-123790900-1');

// FUTURE_TODO: Use Firebase Remote Config to control this.
const DEFAULT_COURSE_ID = String(window.localStorage.getItem('lastid') || 'info4998');

// Since the type is too polymorphic, we have to use the any type in the next few lines.
type PrivateRouteProps<P extends { courseId?: string }> = {
    component: React.ComponentType<RouteComponentProps<P>>;
    requireProfessor: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [restKey: string]: any;
};

const getDefaultRedirectCourseId = (user: FireUser | undefined, courses: readonly FireCourse[]): string => {
    if (user && user.courses) {
        const firstCourseId = user.courses[0];
        if (firstCourseId !== undefined) {
            return firstCourseId;
        }
    }
    return DEFAULT_COURSE_ID;
};

const PrivateRoute = <P extends { courseId?: string }>(
    { component, requireProfessor, ...rest }: PrivateRouteProps<P>
) => {
    const courses = useAllCourses();

    // Show a loader or redirect based on current auth state
    // isLoggedIn STATES:
    // 0: Fetching currently logged in status
    // 1: Not logged in
    // 2: Logged in

    const courseId: string | null | undefined = rest.computedMatch.params.courseId;
    // const courseId: string = requireProfessor ?  : DEFAULT_COURSE_ID;

    const [isLoggedIn, setIsLoggedIn] = React.useState<0 | 1 | 2>(0);
    const user = useMyUser();

    React.useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setIsLoggedIn(2);
                userUpload(user, firestore);
            } else {
                setIsLoggedIn(1);
            }
        });
    }, []);

    if (isLoggedIn === 0) {
        return <Loader active={true} content={'Loading'} />;
    }
    if (isLoggedIn === 1) {
        return <Redirect to={{ pathname: '/login' }} />;
    }
    if (!user || !user.roles || !user.courses || courses.length === 0) {
        // User and courses might load after loging status load.
        // We still display the loading screen while waiting for a final verdict
        // whether the user can enter professor view.
        return <Loader active={true} content={'Loading'} />;
    }

    if (requireProfessor) {
        if (user.roles[courseId || DEFAULT_COURSE_ID] === 'professor') {
            return <Route {...rest} component={component} />;
        }
        return <Redirect to={{ pathname: '/login' }} />;
    }
    if (user.courses.length === 0 && rest.location.pathname !== '/edit') {
        return <Redirect to={{ pathname: '/edit' }} />;
    }
    if (courseId == null) {
        return <Route {...rest} component={component} />;
    }
    const course = courses.find(course => courseId === course.courseId);
    if (course === undefined
        || !moment().isBetween(moment(course.startDate.toDate()), moment(course.endDate.toDate()))) {
        return <Redirect to={{ pathname: '/course/' + getDefaultRedirectCourseId(user, courses) }} />;
    }
    return <Route {...rest} component={component} />;
};

export default () => {
    const user = useMyUser();
    const courses = useAllCourses();

    return (
        <Router>
            <div className="App">
                <Route path="/" component={Analytics} />
                <Switch>
                    <Route path="/login" component={LoginView} />
                    <PrivateRoute path="/edit" component={CourseEditView} requireProfessor={false} />
                    <PrivateRoute path="/home" component={CourseSelectionView} requireProfessor={false} />
                    <PrivateRoute
                        path="/professor-tags/course/:courseId"
                        component={ProfessorTagsView}
                        exact={true}
                        requireProfessor
                    />
                    <PrivateRoute
                        path="/professor-people/course/:courseId"
                        component={ProfessorPeopleView}
                        exact={true}
                        requireProfessor
                    />
                    <PrivateRoute
                        path="/professor-dashboard/course/:courseId"
                        component={ProfessorDashboardView}
                        exact={true}
                        requireProfessor
                    />
                    <PrivateRoute
                        path="/professor-roles/course/:courseId"
                        component={ProfessorRoles}
                        exact={true}
                        requireProfessor
                    />
                    <PrivateRoute
                        path="/professor/course/:courseId"
                        component={ProfessorView}
                        exact={true}
                        requireProfessor
                    />
                    <PrivateRoute
                        path="/course/:courseId/session/:sessionId/:page?"
                        component={SplitView}
                        requireProfessor={false}
                    />
                    <PrivateRoute
                        path="/course/:courseId"
                        component={SplitView}
                        requireProfessor={false}
                    />
                    <Redirect from="/" to={'/course/' + getDefaultRedirectCourseId(user, courses)} />
                </Switch>
            </div>
        </Router>
    );
};
