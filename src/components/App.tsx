/**
 * If you changed the routing logic, make sure to test the following stuff to ensure the behavior
 * is correct:
 *
 * 1. Try sign out and visit private endpoints
 * 2. Try sign in as student and visit an unauthorized professor course.
 * 3. Try sign in as student with zero courses
 * 4. Try sign in as student with some courses
 */

import * as React from "react";
import { RouteComponentProps } from "react-router";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import * as ReactGA from "react-ga";
import { Loader } from "semantic-ui-react";

import { Notifications } from "react-push-notification";
import { Provider, connect } from "react-redux";
import firebase from "firebase/compat/app"
import { auth } from "../firebase";

import { updateAuthStatus, updateUser } from "../redux/actions/auth";
import { store } from "../redux/store";

import AdminView from "./pages/AdminView";
import BlogCMS from "./pages/BlogCMS";
import LoginView from "./pages/LoginView";
import ProfessorView from "./pages/ProfessorView";
import SplitView from "./pages/SplitView";
import ProfessorTagsView from "./pages/ProfessorTagsView";
import ProfessorRoles from "./pages/ProfessorRoles";
import ProfessorDashboardView from "./pages/ProfessorDashboardView";
import ProfessorPeopleView from "./pages/ProfessorPeopleView";
import CourseEditView from "./pages/CourseEditView";
import CourseSelectionView from "./pages/CourseSelectionView";
import { Analytics } from "./includes/Analytics";
import { userUpload } from "../firebasefunctions/user";
import { useMyUser, useAllCourses } from "../firehooks";
import { CURRENT_SEMESTER } from "../constants";
import AdminStudentView from "./pages/AdminStudentView";
import TAView from "./pages/TAView";

ReactGA.initialize("UA-123790900-1");

const findValidCourse = (courses: readonly FireCourse[], courseId: string) =>
    courses.find((course) => courseId === course.courseId && course.semester === CURRENT_SEMESTER);

const getDefaultRedirectCourseId = (user: FireUser | undefined, courses: readonly FireCourse[]): string | undefined => {
    if (user && user.courses) {
        for (let i = 0; i < user.courses.length; i += 1) {
            const courseId = user.courses[i];
            if (findValidCourse(courses, courseId) !== undefined) {
                return courseId;
            }
        }
    }
    return undefined;
};

const getDefaultRedirect = (user: FireUser | undefined, courses: readonly FireCourse[]): string => {
    const courseId = getDefaultRedirectCourseId(user, courses);
    if (courseId) {
        return "/course/" + courseId;
    }
    return "/edit";
};

/**
 * 0: Fetching currently logged in status
 * 1: Not logged in
 * 2: Logged in
 */
const useLoginStatus = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState<0 | 1 | 2>(0);

    React.useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setIsLoggedIn(2);
                userUpload(user, firebase.firestore());
            } else {
                setIsLoggedIn(1);
            }
        });
    }, []);

    return isLoggedIn;
};

const useLoadedData = () => {
    const courses = useAllCourses();
    const user = useMyUser();

    if (!user || !user.roles || !user.courses || courses.length === 0) {
        // User and courses might load after loging status load.
        // We still display the loading screen while waiting for a final verdict
        // whether the user can enter professor view.
        return null;
    }
    return [user, courses] as const;
};

type RouteAction = "LOADING" | "LOGIN" | readonly [FireUser, readonly FireCourse[]];

/** @returns what the router should do considering only login status and data loading status. */
const useBaseRouteAction = (): RouteAction => {
    const isLoggedIn = useLoginStatus();
    const loadedData = useLoadedData();

    if (isLoggedIn === 0) {
        return "LOADING";
    }
    if (isLoggedIn === 1) {
        return "LOGIN";
    }

    return loadedData === null ? "LOADING" : loadedData;
};

/**
 * @returns what the router should do considering only login status, data loading status, and
 * professor permisson check.
 */
const useRouteActionWithPermissionCheck = (
    requireProfessor: boolean | undefined,
    courseId: string | null | undefined
): RouteAction => {
    const action = useBaseRouteAction();
    if (action === "LOADING" || action === "LOGIN") {
        return action;
    }
    const [user] = action;
    if (requireProfessor && user.roles[courseId || "info4998"] !== "professor") {
        return "LOGIN";
    }
    return action;
};

// Since the type is too polymorphic, we have to use the any type in the next few lines.
type PrivateRouteProps<P extends { [K in keyof P]?: any }> = {
    component: React.ComponentType<RouteComponentProps<P>>;
    requireProfessor: boolean;
    requireTA: boolean;
    path: string;
    exact?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [restKey: string]: any;
};

const PrivateRoute = <P extends { [K in keyof P]?: any }>({
    component,
    requireProfessor,
    requireTA,
    ...rest
}: PrivateRouteProps<P>) => {
    const courseId: string | null | undefined = rest.computedMatch.params.courseId;
    const routeAction = useRouteActionWithPermissionCheck(requireProfessor, courseId);

    if (routeAction === "LOADING") {
        return <Loader active={true} content={"Loading"} />;
    }
    if (routeAction === "LOGIN") {
        return <Redirect to={{ pathname: "/login" }} />;
    }

    const [user, courses] = routeAction;

    if (user.courses.length === 0 && rest.location.pathname !== "/edit") {
        return <Redirect to={{ pathname: "/edit" }} />;
    }
    if (courseId != null) {
        const course = findValidCourse(courses, courseId);
        if (course === undefined) {
            return <Redirect to={{ pathname: getDefaultRedirect(user, courses) }} />;
        }
    }
    return <Route {...rest} component={component} />;
};

PrivateRoute.defaultProps = {
    exact: false,
};

const DefaultRoute = () => {
    const routeAction = useBaseRouteAction();

    if (routeAction === "LOADING") {
        return <Loader active={true} content={"Loading"} />;
    }
    if (routeAction === "LOGIN") {
        return <Redirect to={{ pathname: "/login" }} />;
    }
    const [user, courses] = routeAction;
    return <Redirect from="/" to={getDefaultRedirect(user, courses)} />;
};

type AppProps = {
    updateUser: (user: FireUser | undefined) => Promise<void>;
    updateAuthStatus: (authStatus: boolean) => Promise<void>;
};

export default connect(null, { updateUser, updateAuthStatus })(({ updateUser, updateAuthStatus }: AppProps) => {
    const user = useMyUser();
    React.useEffect(() => {
        updateUser(user);
    }, [user, updateUser]);
    React.useEffect(() => {
        auth.onAuthStateChanged((user) => {
            updateAuthStatus(!!user);
        });
    }, [updateAuthStatus]);
    return (
        <Provider store={store}>
            <Router>
                <div className="App">
                    <Notifications />
                    <Route path="/" component={Analytics} />
                    <Switch>
                        <Route path="/login" component={LoginView} />
                        <PrivateRoute 
                            path="/admin" 
                            component={AdminView} 
                            requireProfessor={false} 
                            requireTA={false}
                        />
                        <PrivateRoute 
                            path="/blog" 
                            component={BlogCMS} 
                            requireProfessor={false} 
                            requireTA={false}
                        />
                        <PrivateRoute 
                            path="/edit" 
                            component={CourseEditView} 
                            requireProfessor={false} 
                            requireTA={false}
                        />
                        <PrivateRoute 
                            path="/home"
                            component={CourseSelectionView} 
                            requireProfessor={false} 
                            requireTA={false}
                        />
                        <PrivateRoute
                            path="/professor-tags/course/:courseId"
                            component={ProfessorTagsView}
                            exact={true}
                            requireProfessor
                            requireTA={false}
                        />
                        <PrivateRoute
                            path="/professor-people/course/:courseId"
                            component={ProfessorPeopleView}
                            exact={true}
                            requireProfessor
                            requireTA={false}
                        />
                        <PrivateRoute
                            path="/professor-dashboard/course/:courseId"
                            component={ProfessorDashboardView}
                            exact={true}
                            requireProfessor
                            requireTA={false}
                        />
                        <PrivateRoute
                            path="/professor-roles/course/:courseId"
                            component={ProfessorRoles}
                            exact={true}
                            requireProfessor
                            requireTA={false}
                        />
                        <PrivateRoute
                            path="/professor-student-view/course/:courseId/session/:sessionId/:page?"
                            component={AdminStudentView}
                            exact={true}
                            requireProfessor
                            requireTA={true}
                        />
                        <PrivateRoute
                            path="/professor-student-view/course/:courseId"
                            component={AdminStudentView}
                            exact={true}
                            requireProfessor
                            requireTA={true}
                        />
                        <PrivateRoute
                            path="/professor/course/:courseId"
                            component={ProfessorView}
                            exact={true}
                            requireProfessor
                            requireTA={false}
                        />
                        {/* <PrivateRoute 
                            path="/ta-analytics/course/:courseId"
                            component={TADashboardView}
                            exact={true}
                            requireProfessor={false}
                            requireTA={true}
                        /> */}
                        <PrivateRoute
                            path="/ta/course/:courseId"
                            component={TAView}
                            exact={true}
                            requireProfessor={false}
                            requireTA={true}
                        />
                        <PrivateRoute
                            path="/ta-student-view/course/:courseId"
                            component={AdminStudentView}
                            exact={true}
                            requireProfessor={false}
                            requireTA={true}
                        />
                        <PrivateRoute
                            path="/ta-student-view/course/:courseId/session/:sessionId/:page?"
                            component={AdminStudentView}
                            exact={true}
                            requireProfessor={false}
                            requireTA={true}
                        />
                        <PrivateRoute
                            path="/course/:courseId/session/:sessionId/:page?"
                            component={SplitView}
                            requireProfessor={false}
                            requireTA={false}
                        />
                        <PrivateRoute 
                            path="/course/:courseId" 
                            component={SplitView} 
                            requireProfessor={false} 
                            requireTA={false}
                        />
                        <DefaultRoute />
                    </Switch>
                </div>
            </Router>
        </Provider>
    );
});
