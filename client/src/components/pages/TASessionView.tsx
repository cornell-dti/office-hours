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
                    match={this.props.match}
                    data={{}}
                />
                <ConnectedSessionQuestions match={this.props.match} data={{}} isTA={true} />
            </div>
        );
    }
}

export default TASessionView;
