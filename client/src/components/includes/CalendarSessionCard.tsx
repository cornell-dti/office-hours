import * as React from 'react';
import Moment from 'react-moment';
const chevron = require('../../media/chevron.svg');

class CalendarSessionCard extends React.Component {
    state: {
        redirect: boolean;
    };

    props: {
        session: AppSession
        callback: Function,
        active: boolean,
    };

    handleOnClick = () => {
        this.props.callback(this.props.session.sessionId);
    }

    render() {
        // TODO fetch from backend
        const openPeriod = 30 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */;

        var status = 'closed';
        var timeDesc = '';
        var nowDate = new Date(Date.now());

        const session = this.props.session;
        const questions = session.questionsBySessionId.nodes;
        const tas = session.sessionTasBySessionId.nodes;
        // To test:
        // var nowDate = new Date(this.props.start); // live
        // var nowDate = new Date(this.props.start.getTime() - 1); // open
        if (session.startTime <= nowDate && nowDate <= session.endTime) {
            status = 'live';
            var diff = Math.abs(session.endTime.getTime() - nowDate.getTime());
            timeDesc = 'Ends in ' + Math.floor(diff / 60000) + ' minutes';
        } else {
            var nowPlusOpen = new Date(nowDate.getTime() + openPeriod);
            if (session.startTime <= nowPlusOpen && nowPlusOpen <= session.endTime) {
                status = 'open';
            }
        }

        return (
            <div className={(this.props.active ? 'active' : '') + ' CalendarSessionCard'} onClick={this.handleOnClick}>
                <div className="TimeInfo">
                    <div className="StartTime">
                        <Moment date={session.startTime} interval={0} format={'hh:mm A'} />
                    </div>
                    <div className="EndTime">
                        <Moment date={session.endTime} interval={0} format={'hh:mm A'} />
                    </div>
                </div>
                <div className={'Indicator ' + status}>
                    <div className="Circle" />
                </div>
                <div className="CalendarCard">
                    <div className="TA">
                        {tas.map(ta => ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName).join(' and ')}
                        <span className={'IndicatorDesc ' + status}>{status}</span>
                    </div>
                    <div className="Location">{session.building + ' ' + session.room}</div>
                    <div className="Queue">
                        <span className="Ahead">
                            Waiting: &nbsp;
                            {/* Special class zero exists if we use the num ahead later */}
                            <span className={'AheadNum '}>
                                {questions.filter(q => q.status === 'unresolved').length}
                            </span>
                        </span>
                        <span className="Finished">
                            Finished: &nbsp;
                            <span className="FinishedNum">
                                {questions.filter(q => q.status === 'resolved').length}
                            </span>
                        </span>
                    </div>
                    <div className="TimeDesc">{timeDesc}</div>
                </div>
                <div className="OpenButton">
                    <img src={chevron} />
                </div>
            </div>
        );
    }
}

export default CalendarSessionCard;
