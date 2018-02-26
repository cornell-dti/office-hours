import * as React from 'react';
import { Redirect } from 'react-router';

class SessionInformationHeader extends React.Component {
    state: {
        redirect: boolean;
    };

    props: {
        courseName: string,
        taName: string,
        queueSize: number,
        date: string,
        time: string,
        location: string
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
            return <Redirect push={true} to="/calendar" />;
        }

        return (
            <div className="SessionInformationHeader">
                <div className="header">
                    <button className="CloseButton" type="submit" onClick={this.handleOnClick}>
                        X
                    </button>
                    <div className="CourseInfo">
                        <span className="CourseNum">{this.props.courseName}  </span>
                        {this.props.taName}
                    </div>
                    <div>
                        <div className="QueueInfo">
                            <div className="QueueTotal">
                                {this.props.queueSize}
                            </div>
                            <div>in queue</div>
                        </div>
                        <div className="OfficeHourInfo">
                            <div className="OfficeHourTime">
                                <p>{this.props.date}</p>
                                <p>{this.props.time}</p>
                            </div>
                            <div className="OfficeHourLocation">
                                {this.props.location}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SessionInformationHeader;