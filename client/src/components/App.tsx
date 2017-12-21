import * as React from 'react';
import CalendarView from './pages/CalendarView';
import StudentSessionView from './pages/StudentSessionView';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import '../styles/App.css';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3001/graphql' }),
  cache: new InMemoryCache()
});

class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <h1>Calendar View</h1>
          <CalendarView />
          <h1>Session View</h1>
          <StudentSessionView />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
