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
        this._toggleDetails = this._toggleDetails.bind(this);
    }

    _toggleDetails(prev: boolean) {
        this.props.handleClick(prev)
    }

    render() {
        return (
            <div className="SessionPopularQuestion" onClick={() => this._toggleDetails(true)}>
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