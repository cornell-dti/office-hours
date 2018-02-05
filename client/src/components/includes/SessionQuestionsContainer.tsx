import * as React from 'react';
import '../../styles/SessionQuestionsContainer.css';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import DetailedQuestionView from '../includes/DetailedQuestionView';

class SessionQuestionsContainer extends React.Component {
    state: {
        isDetailed: boolean,
        studentName: string,
        studentQuestion: string,
        tags: string[],
        group: string[]
    };

    constructor(props: {}) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.updateDetails = this.updateDetails.bind(this);
        this.state = {
            isDetailed: false,
            studentName: 'FirstName',
            studentQuestion: 'LastName',
            tags: ['null'],
            group: ['null']
        };
    }

    handleClick(toggle: boolean) {
        this.setState({
            isDetailed: toggle
        });
    }

    updateDetails(studentName: string, studentQuestion: string, tags: string[], group: string[]) {
        this.setState({
            studentName: studentName,
            studentQuestion: studentQuestion,
            tags: tags,
            group: group
        });
    }

    render() {
        return (
            <div className="SessionQuestionsContainer">
                <DetailedQuestionView
                    isDetailed={this.state.isDetailed}
                    handleClick={this.handleClick}
                    studentName={this.state.studentName}
                    studentQuestion={this.state.studentQuestion}
                    tags={this.state.tags}
                    group={this.state.group}
                />
                <div>
                    <p className="Queue">Queue</p>
                </div>
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    updateDetails={this.updateDetails}
                    studentName="Karun Singh"
                    studentQuestion="How do I start Assignment 1?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={10}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    updateDetails={this.updateDetails}
                    studentName="Shefali Agarwal"
                    studentQuestion="How do I start Assignment 2?"
                    tags={['Assignment 2', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={20}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    updateDetails={this.updateDetails}
                    studentName="Horace He"
                    studentQuestion="How do I start Assignment 3?"
                    tags={['Assignment 3', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={30}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    updateDetails={this.updateDetails}
                    studentName="Tiffany Wang"
                    studentQuestion="How do I start Assignment 4?"
                    tags={['Assignment 4', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={40}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    updateDetails={this.updateDetails}
                    studentName="Joyelle Gilbert"
                    studentQuestion="How do I start Assignment 5?"
                    tags={['Assignment 5', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={50}
                />
            </div>
        );
    }
}

export default SessionQuestionsContainer;