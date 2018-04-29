import * as React from 'react';
import Moment from 'react-moment';

class CalendarSessionCard extends React.Component {
    state: {
        redirect: boolean;
    };

    props: {
        start: Date,
        end: Date,
        ta: string,
        location: string,
        resolvedNum: number,
        aheadNum: number,
        id: number,
        callback: Function
    };

    handleOnClick = () => {
        this.props.callback(this.props.id);
    }

    render() {
        // TODO fetch from backend
        const openPeriod = 30 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */;

        var status = 'closed';
        var timeDesc = '';
        var nowDate = new Date(Date.now());
        // To test:
        // var nowDate = new Date(this.props.start); // live
        // var nowDate = new Date(this.props.start.getTime() - 1); // open
        if (this.props.start <= nowDate && nowDate <= this.props.end) {
            status = 'live';
            var diff = Math.abs(this.props.end.getTime() - nowDate.getTime());
            timeDesc = 'Ends in ' + Math.floor(diff / 60000) + ' minutes';
        } else {
            var nowPlusOpen = new Date(nowDate.getTime() + openPeriod);
            if (this.props.start <= nowPlusOpen && nowPlusOpen <= this.props.end) {
                status = 'open';
            }
        }

        var zero = '';
        if (this.props.aheadNum === 0) {
            zero = 'zero';
        }

        return (
            <div className="CalendarSessionCard" onClick={this.handleOnClick}>
                <div className="TimeInfo">
                    <div className="StartTime">
                        <Moment date={this.props.start} interval={0} format={'hh:mm A'} />
                    </div>
                    <div className="EndTime">
                        <Moment date={this.props.end} interval={0} format={'hh:mm A'} />
                    </div>
                </div>
                <div className={'Indicator ' + status}>
                    <div className="Circle" />
                </div>
                <div className="CalendarCard">
                    <div className="TA">
                        {this.props.ta}
                        <span className={'IndicatorDesc ' + status}>{status}</span>
                    </div>
                    <div className="Location">{this.props.location}</div>
                    <div className="Queue">
                        <span className="Ahead">
                            Ahead: &nbsp;
                            <span className={'AheadNum ' + zero}>{this.props.aheadNum}</span>
                        </span>
                        <span className="Finished">
                            Finished: &nbsp;
                            <span className="FinishedNum">{this.props.resolvedNum}</span>
                        </span>
                    </div>
                    <div className="TimeDesc">{timeDesc}</div>
                </div>
                <div className="OpenButton">
                    <i className="angle right icon" />
                </div>
            </div>
        );
    }
}

export default CalendarSessionCard;
