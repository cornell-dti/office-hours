import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './components/includes/registerServiceWorker';
import './styles/index.min.css';
import 'semantic-ui-css/semantic.min.css';
import { client } from './components/includes/ApolloClient';

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById('root') as HTMLElement,
);

registerServiceWorker();
