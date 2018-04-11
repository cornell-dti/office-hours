import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class SessionJoinButton extends React.Component {
    render() {
        return (
            <div className="SessionJoinButton">
                <p><Icon name="plus"/> Join the Queue</p>
            </div>
        );
    }
}

export default SessionJoinButton;
