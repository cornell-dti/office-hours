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
        studentPicture: string[],
        studentName: string[],
        studentQuestion: string[],
        tags: string[][],
        group: string[][],
        order: string[],
        times: string[],
        isTA: boolean
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
                        studentPicture={this.props.studentPicture[index]}
                        studentName={this.props.studentName[index]}
                        studentQuestion={this.props.studentQuestion[index]}
                        tags={this.props.tags[index]}
                        order={this.props.order[index]}
                        times={this.props.times[index]}
                        index={index}
                        isTA={this.props.isTA}
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
