import * as React                from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';

import '../../../styles/session/SessionQuestionsContainer.css';

class SessionQuestionsContainer extends React.Component {
    render() {
        return (
            <div className="SessionQuestionsContainer">
                <div>
                    <p className="Queue">Queue</p>
                </div>
                <SessionQuestionsComponent />
                <SessionQuestionsComponent />
                <SessionQuestionsComponent />
                <SessionQuestionsComponent />
                <SessionQuestionsComponent />
            </div>
        );
    }
}

export default SessionQuestionsContainer;
