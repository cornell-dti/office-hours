import * as React from 'react';
import LoginView from './pages/LoginView';
import QuestionView from './pages/QuestionView';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Switch } from 'react-router-dom';
import SplitView from './pages/SplitView';

class App extends React.Component {
    render() {
        return (
            <Router>
                <div className="App">
                    <nav>
                        <Link to="/login"> Login View</Link> |
                        <Link to="/question"> Question View</Link> |
                        <Link to="/course/-1"> Split View</Link>
                    </nav>
                    <Route path="/question" component={QuestionView} />
                    <Route path="/login" component={LoginView} />
                    <Switch>
                        <Route path="/course/:courseId/session/:sessionId" component={SplitView} />
                        <Route path="/course/:courseId" component={SplitView} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
