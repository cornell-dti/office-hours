import * as React from 'react';
import { Icon } from 'semantic-ui-react';

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

    redirect = (href: string) => {
        document.location.href = href;
    }

    render() {
        return (
            <div className="MenuBox" tabIndex={1} onBlur={() => this.setMenu(false)}>
                <header className="topBar">
                    <div className="triggerArea" onClick={() => this.setMenu(!this.state.showMenu)} >
                        <div className="userProfile">
                            <img src={this.props.user.computedAvatar} />
                            <span className="name">
                                {this.props.user.computedName}
                            </span>
                        </div>
                    </div>
                </header>
                {this.state.showMenu && (
                    <React.Fragment>
                        <ul className="desktop logoutMenu" tabIndex={1} onClick={() => this.setMenu(false)} >
                            <li onMouseDown={() => this.redirect('/__auth/logout')} >
                                <span><Icon name="sign out" /></span> Log Out
                            </li>
                            <li onMouseDown={() => window.open('https://goo.gl/forms/7ozmsHfXYWNs8Y2i1', '_blank')}>
                                <span><Icon name="edit" /></span>
                                Send Feedback
                            </li>
                            {this.props.role === 'professor' && <React.Fragment>{
                                this.props.context === 'professor'
                                    ? <li onMouseDown={() => this.redirect('/course/' + this.props.courseId)}>
                                        <span><Icon name="sync alternate" /></span>
                                        Switch View
                                    </li>
                                    : <li onMouseDown={() => this.redirect('/professor/course/' + this.props.courseId)}>
                                        <span><Icon name="sync alternate" /></span>
                                        Switch View
                                </li>
                            }</React.Fragment>}
                        </ul>
                    </React.Fragment>
                )}
            </div>
        );
    }
}

export default TopBar;
