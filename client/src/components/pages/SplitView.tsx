import * as React from 'react';
import * as H from 'history';

import SessionView from '../includes/SessionView';
import CalendarView from '../includes/CalendarView';
import ConnectedQuestionView from '../includes/ConnectedQuestionView';

import { firestore, loggedIn$ } from '../../firebase';
import { docData, collectionData } from 'rxfire/firestore';
import { switchMap } from 'rxjs/operators';

// Also update in the main LESS file
const MOBILE_BREAKPOINT = 920;

class SplitView extends React.Component {
    props: {
        history: H.History,
        match: {
            params: {
                courseId: string,
                sessionId: string | null,
                page: string | null
            }
        }
    };

    state: {
        session?: FireSession,
        width: number,
        height: number,
        activeView: string,
        course?: FireCourse,
        courseUser?: FireCourseUser
    };

    sessionView: SessionView | null = null;

    // Keep window size in state for conditional rendering
    componentDidMount() {
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    addedQuestion = () => {
        if (this.sessionView && this.sessionView.questionsContainer) {
            this.sessionView.questionsContainer.props.refetch();
        }
    }

    constructor(props: {}) {
        super(props);
        this.state = {
            width: window.innerWidth,
            height: window.innerHeight,
            activeView: this.props.match.params.page === 'add'
                ? 'addQuestion'
                : this.props.match.params.sessionId ? 'session' : 'calendar'
        };

        // Get Current Course in State
        const course$ = docData(firestore.doc('courses/' + this.props.match.params.courseId), 'courseId');
        course$.subscribe(course => this.setState({ course }));

        // Get Current Session in State
        const session$ = docData(firestore.doc('courses/' + this.props.match.params.sessionId), 'sessionId');
        session$.subscribe(session => this.setState({ session }));

        // Get current course user based on courseId and user
        loggedIn$.pipe(
            switchMap(user => collectionData(
                firestore
                    .collection('courseUsers')
                    .where('userId', '==', firestore.doc('users/' + user.uid))
                    .where('courseId', '==', firestore.doc('courses/' + this.props.match.params.courseId)),
                'courseId'
            ))
            // RYAN_TODO better handle unexpected case w/ no courseUser
        ).subscribe(courseUsers => this.setState({ courseUser: courseUsers[0] }));

        // Handle browser back button
        this.props.history.listen((location, action) => {
            this.setState({
                activeView: location.pathname.indexOf('add') !== -1
                    ? 'addQuestion'
                    : this.props.match.params.sessionId ? 'session' : 'calendar',
                sessionId: parseInt(this.props.match.params.sessionId || '-1', 10)
            });
        });
    }

    // Keep track of active view for mobile
    handleSessionClick = (sessionId: number) => {
        this.props.history.push('/course/' + this.props.match.params.courseId + '/session/' + sessionId);
        this.setState({ sessionId: sessionId, activeView: 'session' });
    }

    handleJoinClick = () => {
        if (this.state.session) {
            this.props.history.push(
                '/course/' + this.props.match.params.courseId + '/session/' + this.state.session.sessionId + '/add'
            );
            this.setState({ activeView: 'addQuestion' });
        }
    }

    handleBackClick = () => {
        this.props.history.push('/course/' + this.props.match.params.courseId);
        this.setState({ activeView: 'calendar', sessionId: -1 });
    }

    // Toggle warning

    render() {
        let courseId = parseInt(this.props.match.params.courseId, 10);
        return (
            <React.Fragment>
                {(this.state.width > MOBILE_BREAKPOINT ||
                    (this.state.width <= MOBILE_BREAKPOINT &&
                        this.state.activeView === 'calendar')) &&
                    <CalendarView
                        course={this.state.course}
                        courseUser={this.state.courseUser}
                        session={this.state.session}
                        sessionCallback={this.handleSessionClick}
                    />
                }{(this.state.width > MOBILE_BREAKPOINT ||
                    (this.state.width <= MOBILE_BREAKPOINT &&
                        this.state.activeView !== 'calendar')) &&
                    <SessionView
                        courseId={courseId}
                        id={-1}
                        isDesktop={this.state.width > MOBILE_BREAKPOINT}
                        backCallback={this.handleBackClick}
                        joinCallback={this.handleJoinClick}
                        ref={(ref) => this.sessionView = ref}
                    />
                }{this.state.activeView === 'addQuestion' &&
                    <React.Fragment>
                        <div className="modal">
                            <ConnectedQuestionView
                                sessionId={-1}
                                courseId={courseId}
                                mobileBreakpoint={MOBILE_BREAKPOINT}
                                data={{ loading: true }}
                                callback={() => this.addedQuestion()}
                            />
                        </div>
                        <div className="modalShade" onClick={() => this.setState({ activeView: 'session' })} />
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }
}

export default SplitView;
