import * as React from 'react';
// import { Icon } from 'semantic-ui-react';

class TopBar extends React.PureComponent {
    props: {
        user: AppUser
        // notification: boolean
    };

    render() {
        return (
            <header className="topBar">
                {/* <button>
                    <Icon.Group>
                        <Icon name="bell outline" size="big" color="grey" />
                        <Icon className="notification" corner={true} name="circle" color="pink" />
                    </Icon.Group>
                </button> */}
                <img src={this.props.user.photoUrl} />
                <span className="name">
                    {this.props.user.computedName}
                </span>
            </header>
        );
    }
}

export default TopBar;
