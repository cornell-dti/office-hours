import * as React from 'react';
import StudentSessionView from './pages/StudentSessionView';
import '../styles/App.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <StudentSessionView />
      </div>
    );
  }
}

export default App;
