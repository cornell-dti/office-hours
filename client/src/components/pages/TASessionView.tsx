import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import ConnectedSessionQuestions from '../includes/ConnectedSessionQuestions';

class TASessionView extends React.Component {
    props: {
        match: {
            params: {
                sessionId: number
            }
        }
    };

    render() {
        return (
            <div className="TASessionView">
                <SessionInformationHeader
                    sessionId={this.props.match.params.sessionId}
                    data={{}}
                />
                <ConnectedSessionQuestions sessionId={this.props.match.params.sessionId} data={{}} isTA={true} />
            </div>
        );
    }
}

export default TASessionView;
