import * as React from 'react';

class CalendarHeader extends React.Component {
    props: {
        currentCourseCode: string;
        isTa: boolean;
        avatar: string | null;
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
            <div className="Header">
                <div className="CalendarHeader">
                    <div className="CurrentCourse">
                        <span>
                            {this.props.currentCourseCode}
                            {this.props.isTa && <span className="TAMarker">TA</span>}
                        </span>
                        {this.props.avatar &&
                            <img
                                className="mobileHeaderFace"
                                onClick={() => this.setMenu(!this.state.showMenu)}
                                src={this.props.avatar}
                            />
                        }
                    </div>
                </div>
                {this.state.showMenu && (
                    <ul className="logoutMenu" onClick={() => this.setMenu(false)} >
                        {/* {this.props.isTa &&
                            <React.Fragment>
                                <li>Cancel Session</li>
                                <li>Change Session</li>
                            </React.Fragment>
                        } */}
                        <li><a href="/__auth/logout">Log Out</a></li>
                        <li><a href="https://goo.gl/forms/7ozmsHfXYWNs8Y2i1" target="_blank">Send Feedback</a></li>
                    </ul>
                )}
            </div>
        );
    }
}

export default CalendarHeader;
