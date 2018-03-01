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
        studentName: string[],
        studentQuestion: string[],
        tags: string[][],
        group: string[][]
        numberOfPeople: number[]
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
        var cardList = this.props.studentName.map(
            (studentName, index) => {
                return (
                    <SessionQuestionsComponent
                        key={index}
                        handleClick={this.handleClick}
                        studentName={studentName}
                        studentQuestion={this.props.studentQuestion[index]}
                        tags={this.props.tags[index]}
                        group={this.props.group[index]}
                        numberOfPeople={this.props.numberOfPeople[index]}
                        index={index}
                    />
                );
            }
        );

        return (
            <div className="SessionQuestionsContainer">
                <DetailedQuestionView
                    isDetailed={this.state.isDetailed}
                    handleClick={this.handleClick}
                    studentName={this.props.studentName[this.state.index]}
                    studentQuestion={this.props.studentQuestion[this.state.index]}
                    tags={this.props.tags[this.state.index]}
                    group={this.props.group[this.state.index]}
                />
                <div>
                    <p className="Queue">Queue</p>
                </div>
                {cardList}
            </div>
        );
    }
}

export default SessionQuestionsContainer;