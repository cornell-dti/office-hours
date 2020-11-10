import * as React from 'react';

type Props = {
    index: number;
    active: boolean;
    day: string;
    date: number;
    handleClick: (...args: any[]) => any;
};

class CalendarDateItem extends React.PureComponent<Props> {
    _onClick = () => {
        this.props.handleClick(this.props.index);
    };

    render() {
        return (
            <button type="button" className={'menuDate' + (this.props.active ? ' active' : '')} onClick={this._onClick}>
                <div className="day">{this.props.day}</div>
                <div className="date">{this.props.date}</div>
            </button>
        );
    }
}

export default CalendarDateItem;
