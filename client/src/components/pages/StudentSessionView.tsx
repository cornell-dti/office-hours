import * as React from 'react';
import '../../styles/StudentSessionView.css';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import SessionPopularQuestionsContainer from '../includes/SessionPopularQuestionsContainer';
import SessionJoinButton from '../includes/SessionJoinButton';

class StudentSessionView extends React.Component {
    render() {
        return (
            <div className="StudentSessionView">
                <SessionInformationHeader
                    courseName="CS 3110"
                    taName="Michael Clarkson"
                    queueSize={14}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                />
                <SessionPopularQuestionsContainer />
                <SessionQuestionsContainer />
                <SessionJoinButton />
            </div>
        );
    }
}

export default StudentSessionView;