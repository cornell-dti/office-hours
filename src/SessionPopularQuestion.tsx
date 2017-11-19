import * as React from 'react';
import './SessionPopularQuestion.css';

class SessionPopularQuestion extends React.Component {
    render() {
        return(
            <div className="SessionPopularQuestion">
                <div className="SessionPopularQuestion-Text">
                    How do you implement recursion on question 4?
                </div>
                <div className="SessionPopularQuestion-People">
                    n: 2
                </div>
            </div>
        );
    }
}

export default SessionPopularQuestion;