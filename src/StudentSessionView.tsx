import * as React from 'react';
import './StudentSessionView.css';
import SessionInformationHeader from './SessionInformationHeader';
import SessionQuestionsContainer from './SessionQuestionsContainer';
import SessionPopularQuestionsContainer from './SessionPopularQuestionsContainer';

class StudentSessionView extends React.Component {
    render() {
        return(
            <div className="StudentSessionView">
                <SessionInformationHeader />
                <SessionPopularQuestionsContainer />
                <SessionQuestionsContainer />
            </div>
        );
    }
}

export default StudentSessionView;