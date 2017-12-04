import * as React from 'react';
import '../../styles/CalendarDateSelect.css';
import CalendarDateItem from './CalendarDateItem';

class CalendarDateSelect extends React.Component {

    props: {
        dayList: string[],
        dateList: number[],
        hasOHList: boolean[]
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
            <div className="CalendarDateSelect" >
                <div className="CalendarDateSelect-Month">Nov, 2017</div>
                <div className="CalendarDateSelect-Dates">
                    {dateItems}
                </div>
            </div>
        );
    }
}

export default CalendarDateSelect;