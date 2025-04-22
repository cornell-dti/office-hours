import * as React from 'react';
import sessionIndicator from '../../media/sessionIndicator.svg'

type Props = {
    index: number;
    active: boolean;
    day: string;
    date: number;
    handleClick: (item: number) => void;
    hasSession: boolean;
};

class CalendarDateItem extends React.PureComponent<Props> {
    _onClick = () => {
        this.props.handleClick(this.props.index);
    };

    render() {
        return (
            <button type="button" className={'menuDate' + (this.props.active ? ' active' : '')}
            data-cy={this.props.active ? "calDateItem-active": ""}
            onClick={this._onClick}>
                <div className="day">{this.props.day}</div>
                <div className="date">{this.props.date}</div>
                <div className="indicator">
                    {this.props.hasSession && !this.props.active && 
                        <img src={sessionIndicator} alt="session indicator" />}
                </div>
            </button>
        );
    }
}

export default CalendarDateItem;
