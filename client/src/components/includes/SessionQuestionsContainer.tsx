import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';

class SessionQuestionsContainer extends React.Component {
    props: {
        handleClick: Function
    };

    render() {
        return (
            <div className="SessionQuestionsContainer">

                <div>
                    <p className="Queue">Queue</p>
                </div>
                <SessionQuestionsComponent
                    handleClick={this.props.handleClick}
                />
                <SessionQuestionsComponent
                    handleClick={this.props.handleClick}
                />
                <SessionQuestionsComponent
                    handleClick={this.props.handleClick}
                />
                <SessionQuestionsComponent
                    handleClick={this.props.handleClick}
                />
                <SessionQuestionsComponent
                    handleClick={this.props.handleClick}
                />
            </div>
        );
    }
}

export default SessionQuestionsContainer;