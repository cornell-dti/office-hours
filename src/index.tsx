import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import * as ServiceWorker from './components/includes/registerServiceWorker';
import './styles/index.min.css';
import 'semantic-ui-css/semantic.min.css';

ReactDOM.render(
    <App />,
    document.getElementById('root') as HTMLElement
);

ServiceWorker.unregister();
