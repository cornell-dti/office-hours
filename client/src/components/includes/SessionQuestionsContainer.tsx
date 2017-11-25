import * as React from 'react';
import '../../styles/SessionQuestionsContainer.css';
import SessionQuestionsComponent from './SessionQuestionsComponent';

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