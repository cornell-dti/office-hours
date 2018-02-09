import * as React from 'react';
import CalendarDateItem from './CalendarDateItem';

class CalendarDateSelect extends React.Component {

    props: {
        dayList: string[],
        dateList: number[],
        hasOHList: boolean[],
        monthYear: string,
        handleClick: Function
    };

    state: {
        active: number
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            active: 0   // index of currently selected date
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
        const dayList = this.props.dayList;
        const dateList = this.props.dateList;
        const hasOHList = this.props.hasOHList;
        const dateItems: {}[] = [];
        for (var i = 0; i < 7; i++) {
            const iDay = dayList[i];
            const iDate = dateList[i];
            const iHasOH = hasOHList[i];
            const iActive = (i === this.state.active);
            dateItems.push(
                (
                    <CalendarDateItem
                        key={i}
                        index={i}
                        day={iDay}
                        date={iDate}
                        hasOH={iHasOH}
                        active={iActive}
                        handleClick={this.handleClick}
                    />
                )
            );
        }

        return (
            <div className="CalendarDateSelect">
                <div className="month">{this.props.monthYear}</div>
                <div className="dates">
                    {dateItems}
                </div>
            </div>
        );
    }
}

export default CalendarDateSelect;