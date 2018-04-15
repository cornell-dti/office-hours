import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { Redirect } from 'react-router';

class SessionJoinButton extends React.Component {

    state: {
        redirect: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            redirect: false
        };
    }

    handleOnClick = () => {
        this.setState({
            redirect: true
        });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to={'/question'} />;
        }

        return (
            <div className="SessionJoinButton" onClick={this.handleOnClick}>
                <p><Icon name="plus" /> Join the Queue</p>
            </div>
        );
    }
}

export default SessionJoinButton;
