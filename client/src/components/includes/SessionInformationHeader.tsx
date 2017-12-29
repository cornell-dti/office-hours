import * as React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/SessionInformationHeader.css';

class SessionInformationHeader extends React.Component {
    props: {
        courseName: string,
        taName: string,
        queueSize: number,
        date: string,
        time: string,
        location: string
    };

    render() {
        return (
            <div className="SessionInformationHeader">
                <div className="header">
                    <Link to="/calendar">
                        <div className="CloseButton">
                            x
                        </div>
                    </Link>
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