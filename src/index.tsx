import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import App from './components/App';
import {store} from './redux/store';
import * as ServiceWorker from './components/includes/registerServiceWorker';
import './styles/index.scss';
import 'semantic-ui-css/semantic.min.css';

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root') as HTMLElement
);

ServiceWorker.unregister();
