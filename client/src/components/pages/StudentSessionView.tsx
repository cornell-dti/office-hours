import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
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
        return (
            <div className={'StudentSessionView'}>
                <SessionInformationHeader
                    sessionId={this.props.match.params.sessionId}
                    data={{}}
                />
                <SessionJoinButton />
                <ConnectedSessionQuestions sessionId={this.props.match.params.sessionId} data={{}} isTA={false} />
            </div>
        );
    }
}

export default StudentSessionView;
