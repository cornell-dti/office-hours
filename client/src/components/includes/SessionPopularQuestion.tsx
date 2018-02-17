import * as React from 'react';
import '../../styles/SessionPopularQuestion.css';

class SessionPopularQuestion extends React.Component {

    props: {
        question: string,
        numPeople: number
    };

    render() {
        return (
            <div className="SessionPopularQuestion">
                <div className="SessionPopularQuestion-Text">
                    {this.props.question}
                </div>
                <div className="SessionPopularQuestion-People">
                    n: {this.props.numPeople}
                </div>
            </div>
        );
    }
}

export default SessionPopularQuestion;