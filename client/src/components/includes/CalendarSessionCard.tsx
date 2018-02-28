import * as React from 'react';
import Moment from 'react-moment';
import { Redirect } from 'react-router';

class CalendarSessionCard extends React.Component {

    state: {
        redirect: boolean;
    };

    props: {
        start: number,
        end: number,
        ta: string,
        location: string,
        resolvedNum: number,
        aheadNum: number
        id: number
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

        if (this.state.redirect) {
            return <Redirect push={true} to={'/session/' + this.props.id} />;
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
                    <div className="CalendarCard" onClick={this.handleOnClick}>
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