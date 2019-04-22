import * as React from 'react';
import * as H from 'history';

import SessionView from '../includes/SessionView';
import CalendarView from '../includes/CalendarView';
import ConnectedQuestionView from '../includes/ConnectedQuestionView';

import { firestore } from '../includes/firebase';
import * as firebase from 'firebase/app';

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
        sessionId: string,
        width: number,
        height: number,
        activeView: string,
        courses: FireCourse[]
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
            sessionId: this.props.match.params.sessionId || 'null',
            width: window.innerWidth,
            height: window.innerHeight,
            courses: [],
            activeView: this.props.match.params.page === 'add'
                ? 'addQuestion'
                : this.props.match.params.sessionId ? 'session' : 'calendar'
        };

        // Handle browser back button
        this.props.history.listen((location, action) => {
            this.setState({
                activeView: location.pathname.indexOf('add') !== -1
                    ? 'addQuestion'
                    : this.props.match.params.sessionId ? 'session' : 'calendar',
                sessionId: this.props.match.params.sessionId || '-1'
            });
        });

        firestore
            .collection('courses')
            .onSnapshot((querySnapshot: firebase.firestore.QuerySnapshot) => {
                this.setState({
                    courses: querySnapshot.docs.map((doc) => {
                        return { 'id': doc.id, ...doc.data() };
                    })
                });
            });
    }

    // Keep track of active view for mobile
    handleSessionClick = (sessionId: number) => {
        this.props.history.push('/course/' + this.props.match.params.courseId + '/session/' + sessionId);
        this.setState({ sessionId: sessionId, activeView: 'session' });
    }

    handleJoinClick = () => {
        this.props.history.push(
            '/course/' + this.props.match.params.courseId + '/session/' + this.state.sessionId + '/add'
        );
        this.setState({ activeView: 'addQuestion' });
    }

    handleBackClick = () => {
        this.props.history.push('/course/' + this.props.match.params.courseId);
        this.setState({ activeView: 'calendar', sessionId: -1 });
    }

    // Toggle warning

    render() {
        let courseId = this.props.match.params.courseId;
        return (
            <React.Fragment>
                {(this.state.width > MOBILE_BREAKPOINT ||
                    (this.state.width <= MOBILE_BREAKPOINT &&
                        this.state.activeView === 'calendar')) &&
                    <CalendarView
                        courseId={courseId}
                        courses={this.state.courses}
                        sessionId={this.state.sessionId}
                        sessionCallback={this.handleSessionClick}
                    />
                }
                {(this.state.width > MOBILE_BREAKPOINT ||
                    (this.state.width <= MOBILE_BREAKPOINT &&
                        this.state.activeView !== 'calendar')) &&
                    <SessionView
                        courseId={courseId}
                        id={this.state.sessionId}
                        isDesktop={this.state.width > MOBILE_BREAKPOINT}
                        backCallback={this.handleBackClick}
                        joinCallback={this.handleJoinClick}
                        ref={(ref) => this.sessionView = ref}
                    />
                }{this.state.activeView === 'addQuestion' &&
                    <React.Fragment>
                        <div className="modal">
                            <ConnectedQuestionView
                                sessionId={this.state.sessionId}
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
