import * as React from 'react';
import CalendarView from './pages/CalendarView';
import StudentSessionView from './pages/StudentSessionView';
import LoginView from './pages/LoginView';
import QuestionView from './pages/QuestionView';
import TASessionView from './pages/TASessionView';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import SplitView from './pages/SplitView';

class App extends React.Component {
    render() {
        return (
            <Router>
                <div className="App">
                    Navigate: <Link to="/calendar/1">Calendar View</Link> |
                    <Link to="/session/1"> Student Session View</Link> |
                    <Link to="/login"> Login View</Link> |
                    <Link to="/question"> Question View</Link> |
                    <Link to="/session-ta/1">TA Session View</Link> |
                    <Link to="/desktop/1">Split View</Link>
                    <Route path="/calendar/:courseId" component={CalendarView} />
                    <Route path="/session/:sessionId" component={StudentSessionView} />
                    <Route path="/question" component={QuestionView} />
                    <Route path="/session-ta/:sessionId" component={TASessionView} />
                    <Route path="/login" component={LoginView} />
                    <Route path="/desktop/:courseId" component={SplitView} />
                </div>
            </Router>
        );
    }
}

export default App;
