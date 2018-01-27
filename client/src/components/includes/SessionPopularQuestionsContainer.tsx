import * as React from 'react';
import '../../styles/SessionPopularQuestionsContainer.css';
import SessionPopularQuestion from './SessionPopularQuestion';

class SessionPopularQuestionsContainer extends React.Component {
    props: {
        handleClick: Function
    };

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
                        handleClick={this.props.handleClick}
                    />
                    <SessionPopularQuestion
                        question="This is another question"
                        numPeople={3}
                        handleClick={this.props.handleClick}
                    />
                    <SessionPopularQuestion
                        question="And one more question"
                        numPeople={2}
                        handleClick={this.props.handleClick}
                    />
                </div>
            </div>
        );
    }
}

export default SessionPopularQuestionsContainer;