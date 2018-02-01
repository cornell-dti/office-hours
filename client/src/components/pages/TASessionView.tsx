import * as React from 'react';
import '../../styles/TASessionView.css';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import DetailedQuestionView from '../includes/DetailedQuestionView';

class TASessionView extends React.Component {

    state: {
        sortPopularity: boolean,
        isDetailed: boolean
    };

    constructor(props: {}) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            sortPopularity: false,
            isDetailed: false
        };
    }

    setSortPop(pop: boolean) {
        this.setState({
            sortPopularity: pop
        });
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
        const chron = !this.state.sortPopularity;
        return (
            <div className={'StudentSessionView ' + popup}>
                <SessionInformationHeader
                    courseName="CS 3110"
                    taName="Michael Clarkson"
                    queueSize={14}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                />
                <div className="SessionSorter">
                    <div
                        className={'SessionSorterItem left ' + (chron ? 'selected' : '')}
                        onClick={() => this.setSortPop(false)}
                    >
                        Chronological
                    </div>
                    <div
                        className={'SessionSorterItem ' + (!chron ? 'selected' : '')}
                        onClick={() => this.setSortPop(true)}
                    >
                        Popularity
                    </div>
                </div>
                <SessionQuestionsContainer handleClick={this.handleClick} />
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

export default TASessionView;