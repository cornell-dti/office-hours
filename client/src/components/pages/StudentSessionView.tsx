import * as React from 'react';
import '../../styles/StudentSessionView.css';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import SessionPopularQuestionsContainer from '../includes/SessionPopularQuestionsContainer';

class StudentSessionView extends React.Component {
    render() {
        return (
            <div className="StudentSessionView">
                <SessionInformationHeader />
                <SessionPopularQuestionsContainer />
                <SessionQuestionsContainer />
            </div>
        );
    }
}

export default StudentSessionView;