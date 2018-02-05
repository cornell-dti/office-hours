import * as React from 'react';
import '../../styles/SessionQuestionsContainer.css';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import DetailedQuestionView from '../includes/DetailedQuestionView';

class SessionQuestionsContainer extends React.Component {
    state: {
        isDetailed: boolean
    };

    handleClick(toggle: boolean) {
        this.setState({
            isDetailed: toggle
        });
    }

    constructor(props: {}) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            isDetailed: false
        };
    }

    render() {
        return (
            <div className="SessionQuestionsContainer">
                <DetailedQuestionView
                    studentName="Edgar Stewart"
                    studentQuestion="How do I start Assignment 3?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    isDetailed={this.state.isDetailed}
                    handleClick={this.handleClick}
                />
                <div>
                    <p className="Queue">Queue</p>
                </div>
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    studentName="Karun Singh"
                    studentQuestion="How do I start Assignment 1?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={10}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    studentName="Shefali Agarwal"
                    studentQuestion="How do I start Assignment 2?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={20}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    studentName="Horace He"
                    studentQuestion="How do I start Assignment 3?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={30}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    studentName="Tiffany Wang"
                    studentQuestion="How do I start Assignment 4?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={40}
                />
                <SessionQuestionsComponent
                    handleClick={this.handleClick}
                    studentName="Joyelle Gilbert"
                    studentQuestion="How do I start Assignment 5?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    numberOfPeople={50}
                />
            </div>
        );
    }
}

export default SessionQuestionsContainer;