import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionPopularQuestionsContainer from '../includes/SessionPopularQuestionsContainer';
import SessionJoinButton from '../includes/SessionJoinButton';
import ConnectedSessionQuestions from '../includes/ConnectedSessionQuestions';

class StudentSessionView extends React.Component {
    props: {
        match: {
            params: {
                sessionId: number
            }
        }
    };

    render() {
        var popup = 'PopupInvisible';
        // Moved isDetailed flag to child component, so cannot lock background scroll this way
        // if (this.state.isDetailed) {
        //     popup = 'PopupVisible';
        // }

        return (
            <div className={'StudentSessionView ' + popup}>
                <SessionInformationHeader
                    match={this.props.match}
                    data={{}}
                />
                <SessionPopularQuestionsContainer />
                <ConnectedSessionQuestions match={this.props.match} data={{}} />
                <SessionJoinButton />
            </div>
        );
    }
}

export default StudentSessionView;
