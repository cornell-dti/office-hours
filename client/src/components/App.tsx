import * as React from 'react';
import CalendarView from './pages/CalendarView';
import StudentSessionView from './pages/StudentSessionView';
import LoginView from './pages/LoginView';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import '../styles/App.css';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          Navigate: |
          <Link to="/calendar"> Calendar View</Link> |
          <Link to="/session"> Student Session View</Link> |
          <Link to="/login"> Login Test View</Link>

          <Route path="/calendar" component={CalendarView} />
          <Route path="/session" component={StudentSessionView} />
          <Route path="/login" component={LoginView} />
        </div>
      </Router>
    );
  }
}

export default App;
