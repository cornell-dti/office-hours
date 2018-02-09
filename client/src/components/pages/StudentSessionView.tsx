import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import SessionPopularQuestionsContainer from '../includes/SessionPopularQuestionsContainer';
import DetailedQuestionView from '../includes/DetailedQuestionView';

class StudentSessionView extends React.Component {
    state: {
        isDetailed: boolean
    };

    constructor(props: {}) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            isDetailed: false
        };
    }

    handleClick(toggle: boolean) {
        this.setState({
            isDetailed: toggle
        });
    }

    render() {
        var popup = 'PopupInvisible';
        if (this.state.isDetailed) {
            popup = 'PopupVisible';
        }

        return (
            <div className={'StudentSessionView ' + popup}>
                <SessionInformationHeader
                    courseName="CS 3110"
                    profName="Michael Clarkson"
                    queueSize={14}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                />
                <SessionPopularQuestionsContainer
                    handleClick={this.handleClick}
                />
                <SessionQuestionsContainer
                    handleClick={this.handleClick}
                />
                <DetailedQuestionView
                    studentName="Edgar Stewart"
                    studentQuestion="How do I start Assignment 3?"
                    tags={['Assignment 1', 'Q4', 'Recursion', 'Conceptual']}
                    group={['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada']}
                    isDetailed={this.state.isDetailed}
                    handleClick={this.handleClick}
                />
            </div>
        );
    }
}

export default StudentSessionView;