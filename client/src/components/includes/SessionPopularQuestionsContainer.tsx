import * as React from 'react';
import '../../styles/SessionPopularQuestionsContainer.css';
import SessionPopularQuestion from './SessionPopularQuestion';

class SessionPopularQuestionsContainer extends React.Component {
    handleClick(toggle: boolean) {
        this.setState({
            isDetailed: toggle
        });
    }

    render() {
        return (
            <div className="SessionPopularQuestionsContainer">
                <div className="SessionPopularQuestionsContainer-Title">
                    Popular questions <a className="SessionPopularQuestionsContainer-Collapse">(collapse)</a>
                </div>
                <div className="SessionPopularQuestionsContainer-List">
                    <SessionPopularQuestion
                        question="This is a sample question"
                        numPeople={6}
                        handleClick={this.handleClick}
                    />
                    <SessionPopularQuestion
                        question="This is another question"
                        numPeople={3}
                        handleClick={this.handleClick}
                    />
                    <SessionPopularQuestion
                        question="And one more question"
                        numPeople={2}
                        handleClick={this.handleClick}
                    />
                </div>
            </div>
        );
    }
}

export default SessionPopularQuestionsContainer;