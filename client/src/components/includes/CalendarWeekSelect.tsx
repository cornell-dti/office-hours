import * as React from 'react';

class CalendarWeekSelect extends React.Component {
    monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    props: {
        handleClick?: Function
    }

    state: {
        selectedWeekEpoch: number
    };

    constructor(props: {}) {
        super(props);
        var week = new Date();
        week.setHours(0, 0, 0, 0);
        week.setTime(week.getTime() -
            (week.getDay() - 1) /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        this.state = {
            selectedWeekEpoch: week.getTime()
        };
        this.handleWeekClick = this.handleWeekClick.bind(this);
    }

    getWeek(epoch: number): string {
        var now = new Date(epoch);
        var weekText = '';
        weekText += now.getDate();
        weekText += ' - ';
        now.setTime(now.getTime() +
            6 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        weekText += now.getDate();
        return weekText;
    }

    getMonth(epoch: number): string {
        var now = new Date(epoch);
        return this.monthNames[now.getMonth()];
    }

    // previousWeek = true means that the previous week was clicked in the week selector
    // previousWeek = false means that the next week was clicked in the week selector
    handleWeekClick(previousWeek: boolean) {
        if (previousWeek) {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch -
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        } else {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch +
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        }
        if (this.props.handleClick !== undefined) {
            this.props.handleClick(previousWeek);
        }
    }

    render() {
        const thisWeek = this.getWeek(this.state.selectedWeekEpoch);
        const thisMonth = this.getMonth(this.state.selectedWeekEpoch);

        return (
            <div className="CalendarWeekSelect">
                <span className="LastWeek" onClick={() => this.handleWeekClick(true)}>
                    <i className="angle left icon" />
                </span>
                <span className="CurrentWeek">
                    <div className="Month">
                        {thisMonth}
                    </div>
                    <div className="Days">
                        {thisWeek}
                    </div>
                </span>
                <span className="NextWeek" onClick={() => this.handleWeekClick(false)}>
                    <i className="angle right icon" />
                </span>
            </div>
        );
    }
}

export default CalendarWeekSelect;