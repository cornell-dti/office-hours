import * as React from 'react';
import notif from '../../media/notif.svg'

type Props = {
    index: number;
    active: boolean;
    day: string;
    date: number;
    handleClick: Function;
    hasSession: boolean;
};

class CalendarDateItem extends React.PureComponent<Props> {
    _onClick = () => {
        this.props.handleClick(this.props.index);
    };

    render() {
        return (
            <button type="button" className={'menuDate' + (this.props.active ? ' active' : '')} onClick={this._onClick}>
                <div className="day">{this.props.day}</div>
                <div className="notifications__calendar">
                    {this.props.hasSession && 
                        <img className="notifications__indicator" src={notif} alt="Notification indicator" />}
                </div>
                <div className="date">{this.props.date}</div>
            </button>
        );
    }
}

export default CalendarDateItem;
