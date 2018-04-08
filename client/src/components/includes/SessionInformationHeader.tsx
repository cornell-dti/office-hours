import * as React from 'react';
import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react'

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
        location: string,
        picture: string
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
                    <p className="BackButton" onClick={this.handleOnClick}><i className="left"></i> {this.props.courseName}</p>
                    <div className="CourseInfo">
                        <div className="CourseDetails">
                            <p className="Location">{this.props.location}</p>
                            <p>{this.props.time}</p>
                        </div>
                        <div className="Picture">
                            <img src={this.props.picture}/>
                        </div>
                    </div>
                </div>
                <div className="MoreInformation">
                    <hr/>
                    <div className="QueueInfo">
                        <Icon name="users"/>
                        <p><span className="red">{this.props.queueSize}</span> ahead</p>
                    </div>
                    <div className="OfficeHourInfo">
                        <div className="OfficeHourDate">
                            <p><Icon name="calendar"/> {this.props.date}</p>
                        </div>
                        <p>Held by <span className="black">{this.props.taName}</span></p>
                    </div>
                </div>
            </div>
        );
    }
}

export default SessionInformationHeader;
