import * as React from 'react';
import CalendarDateItem from './CalendarDateItem';

const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

class CalendarDateSelect extends React.Component {
    props: {
        dateList: number[],
        handleClick: Function,
        selectedIndex: number
    };

    state: {
        active: number
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            active: this.props.selectedIndex   // index of currently selected date
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(item: number) {
        this.setState({
            active: item
        });
        this.props.handleClick(item);
    }

    render() {
        const dateList = this.props.dateList;
        const dateItems: {}[] = [];
        for (var i = 0; i < 7; i++) {
            const iDay = dayList[i];
            const iDate = dateList[i];
            const iActive = (i === this.state.active);
            dateItems.push(
                <CalendarDateItem
                    key={i}
                    index={i}
                    day={iDay}
                    date={iDate}
                    active={iActive}
                    handleClick={this.handleClick}
                />
            );
        }

        return (
            <div className="CalendarDateSelect">
                <div className="dates">
                    {dateItems}
                </div>
            </div>
        );
    }
}

export default CalendarDateSelect;
