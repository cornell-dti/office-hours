import * as React from 'react';
import * as H from 'history';

import SessionView from '../includes/SessionView';
import CalendarView from '../includes/CalendarView';
import ConnectedQuestionView from '../includes/ConnectedQuestionView';
import Popup from '../includes/Popup';

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
        sessionId: number,
        width: number,
        height: number,
        activeView: string,
        showFeedbackAfterJoining: boolean,
        showFeedback: boolean,
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
        if (this.state.showFeedbackAfterJoining) {
            this.setState({ showFeedback: true, showFeedbackAfterJoining: false});
        }
    }

    constructor(props: {}) {
        super(props);
        this.state = {
            sessionId: parseInt(this.props.match.params.sessionId || '-1', 10),
            width: window.innerWidth,
            height: window.innerHeight,
            activeView: this.props.match.params.page === 'add'
                ? 'addQuestion'
                : this.props.match.params.sessionId ? 'session' : 'calendar',
            showFeedbackAfterJoining: false,
            showFeedback: false,
        };

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

    handleJoinClick = (showFeedback: boolean) => {
        this.props.history.push(
            '/course/' + this.props.match.params.courseId + '/session/' + this.state.sessionId + '/add'
        );
        this.setState({ activeView: 'addQuestion', showFeedbackAfterJoining: showFeedback });
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
                        courseId={courseId}
                        sessionId={this.state.sessionId}
                        sessionCallback={this.handleSessionClick}
                    />
                }{(this.state.width > MOBILE_BREAKPOINT ||
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
                                sessionId={this.state.sessionId || -1}
                                courseId={courseId}
                                mobileBreakpoint={MOBILE_BREAKPOINT}
                                data={{ loading: true }}
                                callback={() => this.addedQuestion()}
                            />
                        </div>
                        <div className="modalShade" onClick={() => this.setState({ activeView: 'session' })} />
                    </React.Fragment>
                }
                {this.state.showFeedback && (
                    <div className="feedbackModal">
                    <div className={'feedbackShade'} />
                    <div className="Feedback">
                        <Popup 
                            show={this.state.showFeedback} 
                            topTitle="Have an opinion about Queue Me In?" 
                            description="Let us know how your experience on Queue Me In is going.
                            Your feedback is incredibly valuable."
                            buttonLabel="Send Feedback"
                            link="https://goo.gl/forms/7ozmsHfXYWNs8Y2i1"
                            hideFunction={() => this.setState({ showFeedback: false })}
                        />
                    </div>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

export default SplitView;
