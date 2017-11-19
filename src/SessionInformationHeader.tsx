import * as React from 'react';
import './SessionInformationHeader.css';

class SessionInformationHeader extends React.Component {
    render() {
        return(
            <div className="SessionInformationHeader">
                <div className="header">
                    <div className="CourseInfo">
                        <span className="CourseNum">CS 3110  </span>
                        Michael Clarkson
                    </div>
                    <div className="OfficeHourLogistics">
                        <div className="QueueInfo"> 
                            <div className="QueueTotal">14</div>
                            <div>in queue</div>
                        </div>
                        <div className="OfficeHourInfo">
                            <div className="OfficeHourTime">
                                <p>Wednesday, 8 Nov</p>
                                <p>10:00 - 11:00 AM</p>
                            </div>
                            <div className="OfficeHourLocation">
                                G23 Gates Hall
                            </div>
                        </div>
                    </div>
                </div>
                <div className="Spacing" />
                <button className="button" type="submit">
                    Join Queue
                </button>
            </div>
        );
    }
}

export default SessionInformationHeader;