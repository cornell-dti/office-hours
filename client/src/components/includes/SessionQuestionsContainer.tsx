import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import DetailedQuestionView from './DetailedQuestionView';

class SessionQuestionsContainer extends React.Component {
    state: {
        isDetailed: boolean,
        index: number
    };

    props: {
        isDetailed: boolean,
        questions: Question[]
    };

    constructor(props: {}) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            isDetailed: false,
            index: 0
        };
    }

    handleClick(toggle: boolean, index: number) {
        this.setState({
            isDetailed: toggle,
            index: index
        });
    }

    render() {
        var cardList = this.props.questions.map((question: Question, index) => {
            return (
                <SessionQuestionsComponent
                    key={question.id}
                    handleClick={this.handleClick}
                    studentName={question.name}
                    studentQuestion={question.value}
                    tags={question.tags}
                    index={index}
                />
            );
        });

        return (
            <div className="SessionQuestionsContainer">
                {this.props.questions[this.state.index] &&
                    <DetailedQuestionView
                        isDetailed={this.state.isDetailed}
                        handleClick={this.handleClick}
                        studentName={this.props.questions[this.state.index].name}
                        studentQuestion={this.props.questions[this.state.index].value}
                        tags={this.props.questions[this.state.index].tags}
                    />
                }
                <div>
                    <p className="Queue">Queue</p>
                </div>
                {cardList}
            </div>
        );
    }
}

export default SessionQuestionsContainer;
