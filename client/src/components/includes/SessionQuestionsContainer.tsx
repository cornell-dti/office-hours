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
        useFakeData: boolean,
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
        var questions = this.props.questions;
        if (this.props.useFakeData) {
            questions = [
                {
                    id: 1,
                    name: 'Karun Singh',
                    value: 'How do you implement recursion when you try to use function used in question 4?',
                    time: new Date(Date.now()),
                    tags: [
                        {id: 1, value: 'Assignment 2'},
                        {id: 1, value: 'Q4'},
                        {id: 1, value: 'Recursion'},
                        {id: 1, value: 'Conceptual'}
                    ],
                }, {
                    id: 1,
                    name: 'Ryan Slama',
                    value: 'Can you clarify the statistics concept from the prelim?',
                    time: new Date(Date.now()),
                    tags: [
                        {id: 1, value: 'Assignment 2'},
                        {id: 1, value: 'Q4'},
                        {id: 1, value: 'Prelim'},
                        {id: 1, value: 'Statistics'}
                    ],
                }, {
                    id: 1,
                    name: 'Shefali Agarwal',
                    value: 'How can I use the given function to parse dataset 1?',
                    time: new Date(Date.now()),
                    tags: [
                        {id: 1, value: 'Assignment 2'},
                        {id: 1, value: 'Q4'},
                        {id: 1, value: 'Function'},
                        {id: 1, value: 'Dataset'}
                    ],
                }, {
                    id: 1,
                    name: 'Horace He',
                    value: 'I don’t understand how to infer the classification of causality.',
                    time: new Date(Date.now()),
                    tags: [
                        {id: 1, value: 'Assignment 2'},
                        {id: 1, value: 'Q4'},
                        {id: 1, value: 'Recursion'},
                        {id: 1, value: 'Conceptual'}
                    ],
                }, {
                    id: 1,
                    name: 'Tiffany Wang',
                    value: 'Lorem ipsum, I am running out of ideas!',
                    time: new Date(Date.now()),
                    tags: [
                        {id: 1, value: 'Assignment 2'},
                        {id: 1, value: 'Q4'},
                        {id: 1, value: 'Lorem'},
                        {id: 1, value: 'Ipsum'}
                    ],
                }, {
                    id: 1,
                    name: 'Joyelle Gilbert',
                    value: 'How do you implement recursion when you try to use function used in question 4?',
                    time: new Date(Date.now()),
                    tags: [
                        {id: 1, value: 'Assignment 2'},
                        {id: 1, value: 'Q4'},
                        {id: 1, value: 'Recursion'},
                        {id: 1, value: 'Conceptual'}
                    ],
                },
            ];
        }
        var cardList = questions.map((question: Question, index) => {
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
