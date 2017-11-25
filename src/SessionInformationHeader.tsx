import * as React from 'react';
import './SessionInformationHeader.css';

class SessionInformationHeader extends React.Component {
    props: {
        courseName: string,
        profName: string,
        queueSize: number,
        date: string,
        time: string,
        location: string
    };
    
    render() {
        return(
            <div className="SessionInformationHeader">
                <div className="header">
                    <button className="Close" type="submit">
                        X
                    </button>
                    <div className="CourseInfo">
                        <span className="CourseNum">{this.props.courseName}  </span>
                        {this.props.profName}
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
                <button className="button" type="submit">
                    Join Queue
                </button>
            </div>
        );
    }
}

export default SessionInformationHeader;