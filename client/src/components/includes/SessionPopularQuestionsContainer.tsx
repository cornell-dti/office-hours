import * as React from 'react';
import SessionPopularQuestion from './SessionPopularQuestion';

class SessionPopularQuestionsContainer extends React.Component {
    render() {
        return (
            <div className="SessionPopularQuestionsContainer">
                <div className="SessionPopularQuestionsContainer-Title">
                    Popular questions
                </div>
                <div className="SessionPopularQuestionsContainer-List">
                    <SessionPopularQuestion
                        question="This is a sample question"
                        numPeople={6}
                    />
                    <SessionPopularQuestion
                        question="This is another question"
                        numPeople={3}
                    />
                    <SessionPopularQuestion
                        question="And one more question"
                        numPeople={2}
                    />
                </div>
            </div>
        );
    }
}

export default SessionPopularQuestionsContainer;