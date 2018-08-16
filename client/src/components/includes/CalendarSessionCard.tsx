import * as React from 'react';
import Moment from 'react-moment';
const chevron = require('../../media/chevron.svg');

class CalendarSessionCard extends React.Component {
    props: {
        session: AppSession
        callback: Function,
        active: boolean,
        status: string
    };

    handleOnClick = () => {
        this.props.callback(this.props.session.sessionId);
    }

    render() {
        const session = this.props.session;
        const questions = session.questionsBySessionId.nodes;
        const tas = session.sessionTasBySessionId.nodes;

        var timeDesc = '';

        return (
            <div className={(this.props.active && 'active') + ' CalendarSessionCard'} onClick={this.handleOnClick}>
                <div className="TimeInfo">
                    <div className="StartTime">
                        <Moment date={session.startTime} interval={0} format={'hh:mm A'} />
                    </div>
                    <div className="EndTime">
                        <Moment date={session.endTime} interval={0} format={'hh:mm A'} />
                    </div>
                </div>
                <div className={'Indicator ' + this.props.status}>
                    <div className="Circle" />
                </div>
                <div className="CalendarCard">
                    <div className="TA">
                        {tas.map(ta => ta.userByUserId.computedName).join(' and ')}
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
