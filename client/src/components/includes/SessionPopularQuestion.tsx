import * as React from 'react';
import '../../styles/SessionPopularQuestion.css';

class SessionPopularQuestion extends React.Component {

    props: {
        question: string,
        numPeople: number
        handleClick: Function
    };

    constructor(props: {}) {
        super(props);
        this.toggleDetails = this.toggleDetails.bind(this);
    }

    toggleDetails(prev: boolean) {
        this.props.handleClick(prev);
    }

    render() {
        return (
            <div className="SessionPopularQuestion" onClick={() => this.toggleDetails(true)}>
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