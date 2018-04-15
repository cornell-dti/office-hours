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
                    match={this.props.match}
                    data={{}}
                />
                <SessionJoinButton
                    sessionId={this.props.match.params.sessionId}
                />
                <ConnectedSessionQuestions match={this.props.match} data={{}} isTA={false} />
            </div>
        );
    }
}

export default StudentSessionView;
