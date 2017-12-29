import * as React from 'react';
import Moment from 'react-moment';
import { Redirect } from 'react-router';

class CalendarSessionCard extends React.Component {

    props: {
        start: number,
        end: number,
        ta: string,
        location: string,
        resolvedNum: number,
        aheadNum: number
    };

    state: {
        redirectPath: string
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            redirectPath: ''
        };
    }

    handleOnClick = (path: string) => {
        this.setState({ redirectPath: path });
    }

    render() {
        if (this.state.redirectPath.length > 0) {
            return <Redirect push={true} to={this.state.redirectPath} />;
        }
        const openPeriod = 30 /* minutes */ * 60 /* seconds */;
        var status = 'closed';
        var startDate = new Date(this.props.start);
        var endDate = new Date(this.props.end);
        var nowDate = new Date();
        // To test:
        // var nowDate = new Date(this.props.start); // live
        // var nowDate = new Date(this.props.start - 1); // open
        if (startDate <= nowDate && nowDate <= endDate) {
            status = 'live';
        } else {
            var nowPlusOpen = new Date(nowDate.getTime() + openPeriod);
            if (startDate <= nowPlusOpen && nowPlusOpen <= endDate) {
                status = 'open';
            }
        }
        return (
            <div className="CalendarSessionCard">
                <div className="SessionIndicators">
                    <div className={'SessionIndicator ' + status} />
                    <div className="CalendarTimeInfo">
                        <Moment
                            unix={true}
                            date={this.props.start}
                            interval={0}
                            format={'hh:mm A'}
                        />
                        -
                        <Moment
                            unix={true}
                            date={this.props.end}
                            interval={0}
                            format={'hh:mm A'}
                        />
                    </div>
                </div>
                <div className="CalendarInfo">
                    <div className="SessionDivider" />
                    <div className="CalendarCard" onClick={() => this.handleOnClick('/session')}>
                        <div className="CalendarUpperInfo">
                            <div className="CalendarTa">
                                {this.props.ta}
                            </div>
                            <div className="CalendarOpenButton">
                                <i className="angle right icon" />
                            </div>
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

export default CalendarSessionCard;