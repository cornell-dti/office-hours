import * as React from 'react';
import CalendarView from './pages/CalendarView';
import StudentSessionView from './pages/StudentSessionView';
import LoginView from './pages/LoginView';
import ConnectedQuestionView from './pages/ConnectedQuestionView';
import TASessionView from './pages/TASessionView';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

class App extends React.Component {
    render() {
        return (
            <Router>
                <div className="App">
                    Navigate: <Link to="/calendar/1">Calendar View</Link> |
                    <Link to="/session/1"> Student Session View</Link> |
                    <Link to="/login"> Login View</Link> |
                    <Link to="/question/1"> Question View</Link> | <Link to="/session-ta/1">TA Session View</Link>
                    <Route path="/calendar/:courseId" component={CalendarView} />
                    <Route path="/session/:sessionId" component={StudentSessionView} />
                    <Route path="/question/:sessionId" component={ConnectedQuestionView} />
                    <Route path="/session-ta/:sessionId" component={TASessionView} />
                    <Route path="/login" component={LoginView} />
                </div>
            </Router>
        );
    }
}

export default App;
