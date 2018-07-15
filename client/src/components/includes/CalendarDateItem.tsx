import * as React from 'react';

class CalendarDateItem extends React.PureComponent {
    props: {
        index: number,
        active: boolean,
        day: string,
        date: number,
        handleClick: Function
    };

    _onClick = () => {
        this.props.handleClick(this.props.index);
    }

    render() {
        return (
            <div className={'menuDate' + (this.props.active ? ' active' : '')} onClick={this._onClick}>
                <div className="day">{this.props.day}</div>
                <div className="date">{this.props.date}</div>
            </div>
        );
    }
}

export default CalendarDateItem;
