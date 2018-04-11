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
                    sessionId={this.props.match.params.sessionId}
                    data={{}}
                />
                <SessionPopularQuestionsContainer />
                <ConnectedSessionQuestions sessionId={this.props.match.params.sessionId} data={{}} />
                <SessionJoinButton />
            </div>
        );
    }
}

export default StudentSessionView;
