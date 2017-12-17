import * as React from 'react';

class CalendarSessions extends React.Component {

    props: {
        start: number,
        end: number,
        ta: string,
        location: string,
        resolvedNum: number,
        aheadNum: number
    };

    render() {
        return (
            <div className="CalendarSessionCard">
                <div className="SessionIndicators">
                    <div className="SessionIndicator" />
                    <div className="CalendarTimeInfo">
                        {this.props.start}-{this.props.end}
                    </div>
                </div>
                <div className="CalendarInfo">
                    <div className="SessionDivider" />
                    <div className="CalendarCard">
                        <div className="CalendarUpperInfo">
                            <div className="CalendarTa">
                                {this.props.ta}
                            </div>
                            <button className="CalendarOpenButton">
                                <i className="angle right icon" />
                            </button>
                        </div>
                        <div className="CalendarLowerInfo">
                            <div className="CalendarLocation">
                                {this.props.location}
                            </div>
                            <div className="CalendarQueueInfo">
                                <div className="CalendarFinishedInfo">
                                    <div className="CalendarQueueText">Finished</div>
                                    <div className="CalendarQueueNumber">{this.props.resolvedNum}</div>
                                </div>
                                <div className="CalendarAheadInfo">
                                    <div className="CalendarQueueText">Ahead</div>
                                    <div className="CalendarQueueNumber">{this.props.aheadNum}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CalendarSessions;