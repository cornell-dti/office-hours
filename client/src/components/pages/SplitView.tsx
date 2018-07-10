import * as React from 'react';
import * as H from 'history';

import SessionView from '../includes/SessionView';
import CalendarView from '../includes/CalendarView';
import ConnectedQuestionView from '../includes/ConnectedQuestionView';

// Also update in the main LESS file
const MOBILE_BREAKPOINT = 920;

class SplitView extends React.Component {
    props: {
        history: H.History,
        match: {
            params: {
                courseId: number,
                sessionId: number | null
            }
        }
    };

    state: {
        sessionId: number,
        width: number,
        height: number,
        activeView: string,
    };

    // Keep window size in state for conditional rendering
    componentDidMount() {
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    constructor(props: {}) {
        super(props);
        this.state = {
            sessionId: this.props.match.params.sessionId || -1,
            width: window.innerWidth,
            height: window.innerHeight,
            activeView: this.props.match.params.sessionId ? 'session' : 'calendar'
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        // Handle browser back button
        this.props.history.listen((location, action) => {
            if (this.props.match.params.sessionId) {
                this.setState({ activeView: 'session', sessionId: this.props.match.params.sessionId });
            } else {
                this.setState({ activeView: 'calendar', sessionId: -1 });
            }
        });
    }

    // Keep track of active view for mobile
    handleSessionClick = (sessionId: number) => {
        this.props.history.push('/course/' + this.props.match.params.courseId + '/session/' + sessionId);
        this.setState({ sessionId: sessionId, activeView: 'session' });
    }

    handleJoinClick = () => {
        this.setState({ activeView: 'addQuestion' });
    }

    handleBackClick = () => {
        this.props.history.push('/course/' + this.props.match.params.courseId);
        this.setState({ activeView: 'calendar', sessionId: -1 });
    }

    render() {
        return (
            <React.Fragment>
                {
                    (this.state.width > MOBILE_BREAKPOINT ||
                        (this.state.width <= MOBILE_BREAKPOINT &&
                            this.state.activeView === 'calendar')) &&
                    <CalendarView
                        courseId={this.props.match.params.courseId}
                        sessionId={this.state.sessionId}
                        sessionCallback={this.handleSessionClick}
                    />
                }{
                    (this.state.width > MOBILE_BREAKPOINT ||
                        (this.state.width <= MOBILE_BREAKPOINT &&
                            this.state.activeView !== 'calendar')) &&
                    <SessionView
                        courseId={this.props.match.params.courseId}
                        id={this.state.sessionId}
                        isDesktop={this.state.width > MOBILE_BREAKPOINT}
                        backCallback={this.handleBackClick}
                        joinCallback={this.handleJoinClick}
                    />
                }{
                    (this.state.activeView === 'addQuestion') &&
                    <React.Fragment>
                        <div className="modal">
                            <ConnectedQuestionView
                                sessionId={this.state.sessionId || -1}
                                courseId={this.props.match.params.courseId}
                                data={{ loading: true }}
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
