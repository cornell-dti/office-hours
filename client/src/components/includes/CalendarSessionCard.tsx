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
        var timeDesc = 'Queue is not open yet';
        var startDate = new Date(this.props.start);
        var endDate = new Date(this.props.end);
        var nowDate = new Date();
        // To test:
        // var nowDate = new Date(this.props.start); // live
        // var nowDate = new Date(this.props.start - 1); // open
        if (startDate <= nowDate && nowDate <= endDate) {
            status = 'live';
            var diff = Math.abs(endDate.getTime() - startDate.getTime());
            timeDesc = 'Ends in ' + Math.floor(diff / 60) + ' minutes';
        } else {
            var nowPlusOpen = new Date(nowDate.getTime() + openPeriod);
            if (startDate <= nowPlusOpen && nowPlusOpen <= endDate) {
                status = 'open';
                timeDesc = 'Queue just opened';
            }
        }

        if (this.state.redirect) {
            return <Redirect push={true} to={'/session/' + this.props.id} />;
        }

        return (
            <div className="CalendarSessionCard" onClick={this.handleOnClick}>
                <div className="TimeInfo">
                    <div className="StartTime">
                        <Moment
                            unix={true}
                            date={this.props.start}
                            interval={0}
                            format={'hh:mm A'}
                        />
                    </div>
                    <div className="EndTime">
                        <Moment
                            unix={true}
                            date={this.props.end}
                            interval={0}
                            format={'hh:mm A'}
                        />
                    </div>
                </div>
                <div className={'Indicator ' + status}>
                    <div className="Circle" />
                    <div className="Line" />
                </div>
                <div className="CalendarCard">
                    <div className="TA">
                        {this.props.ta}
                        <span className={'IndicatorDesc ' + status}>
                            {status}
                        </span>
                    </div>
                    <div className="Location">
                        {this.props.location}
                    </div>
                    <div className="Queue">
                        <span className="Ahead">
                            Ahead: &nbsp;
                            <span className="AheadNum">{this.props.aheadNum}</span>
                        </span>
                        <span className="Finished">
                            Finished: &nbsp;
                                <span className="FinishedNum">{this.props.resolvedNum}</span>
                        </span>
                    </div>
                    <div className="TimeDesc">
                        {timeDesc}
                    </div>
                </div>
                <div className="OpenButton">
                    <i className="angle right icon" />
                </div>
            </div>
        );
    }
}

export default CalendarSessionCard;