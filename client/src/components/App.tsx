import * as React from 'react';
import CalendarView from './pages/CalendarView';
import StudentSessionView from './pages/StudentSessionView';
import QuestionView from './pages/QuestionView';
import '../styles/App.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <h1>Calendar View</h1>
        <CalendarView />
        <h1>Session View</h1>
        <StudentSessionView />
        <h1>Question View</h1>
        <QuestionView />
      </div>
    );
  }
}

export default App;
