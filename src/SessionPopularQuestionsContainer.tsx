import * as React from 'react';
import './SessionPopularQuestionsContainer.css';
import SessionPopularQuestion from './SessionPopularQuestion';

class SessionPopularQuestionsContainer extends React.Component {
    render() {
        return(
            <div className="SessionPopularQuestionsContainer">
                <div className="SessionPopularQuestionsContainer-Title">
                    Popular questions <a className="SessionPopularQuestionsContainer-Collapse">(collapse)</a>
                </div>
                <div className="SessionPopularQuestionsContainer-List">
                    <SessionPopularQuestion />
                    <SessionPopularQuestion />
                    <SessionPopularQuestion />
                </div>
            </div>
        );
    }
}

export default SessionPopularQuestionsContainer;