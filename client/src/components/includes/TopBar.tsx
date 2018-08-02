import * as React from 'react';
// import { Icon } from 'semantic-ui-react';

class TopBar extends React.PureComponent {
    props: {
        courseId: number,
        user: AppUser,
        // A user's role: student, ta, or professor
        // We show TA's and Profs extra links
        role: string,
        // Whether we're in a "professor" view or "student" view
        // controls where "switch view" goes
        context: string
    };

    state: {
        showMenu: boolean;
    };

    constructor(props: {}) {
        super(props);
        this.state = { showMenu: false };
    }

    setMenu = (status: boolean) => {
        this.setState({ showMenu: status });
    }

    render() {
        return (
            <React.Fragment>
                <header className="topBar">
                    {/* <button>
                    <Icon.Group>
                        <Icon name="bell outline" size="big" color="grey" />
                        <Icon className="notification" corner={true} name="circle" color="pink" />
                    </Icon.Group>
                </button> */}
                    <div className="triggerArea" onClick={() => this.setMenu(!this.state.showMenu)}>
                        <img src={this.props.user.computedAvatar} />
                        <span className="name">
                            {this.props.user.computedName}
                        </span>
                    </div>
                </header>
                {this.state.showMenu && (
                    <ul className="desktop logoutMenu" onClick={() => this.setMenu(false)} >
                        {/* {this.props.isTa &&
                            <React.Fragment>
                                <li>Cancel Session</li>
                                <li>Change Session</li>
                            </React.Fragment>
                        } */}
                        <li><a href="/__auth/logout">Log Out</a></li>
                        <li><a href="https://goo.gl/forms/7ozmsHfXYWNs8Y2i1" target="_blank">Send Feedback</a></li>
                        {this.props.role === 'professor' && <React.Fragment>{
                            this.props.context === 'professor'
                                ? <li><a href={'/course/' + this.props.courseId} >Switch View</a></li>
                                : <li><a href={'/professor/course/' + this.props.courseId}>Switch View</a></li>
                        }</React.Fragment>}
                    </ul>
                )}
            </React.Fragment>
        );
    }
}

export default TopBar;
