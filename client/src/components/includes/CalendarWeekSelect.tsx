import * as React from 'react';
const chevron = require('../../media/chevron.svg');

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

class CalendarWeekSelect extends React.Component {

    monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    props: {
        handleClick?: Function,
        selectedWeekEpoch?: number,
    };

    state: {
        selectedWeekEpoch: number
    };

    constructor(props: {}) {
        super(props);
        if (this.props.selectedWeekEpoch) {
            this.state = {
                selectedWeekEpoch: this.props.selectedWeekEpoch,
            };
        } else {
            var week = new Date();
            week.setHours(0, 0, 0, 0);
            var daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
            week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
            this.state = {
                selectedWeekEpoch: week.getTime()
            };
        }
        this.handleWeekClick = this.handleWeekClick.bind(this);
    }

    // getWeekText(epoch: number): string {
    //     var now = new Date(epoch);
    //     var weekText = '';
    //     weekText += now.getDate();
    //     weekText += ' - ';
    //     now.setTime(now.getTime() +
    //         6 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
    //     weekText += now.getDate();
    //     return weekText;
    // }

    getMonth(epoch: number): string {
        var now = new Date(epoch);
        return this.monthNames[now.getMonth()];
    }

    getDay(epoch: number): number {
        var now = new Date(epoch);
        return now.getDate();
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
        // const thisWeek = this.getWeek(this.state.selectedWeekEpoch);
        // const thisMonth = this.getMonth(this.state.selectedWeekEpoch);

        const thisWeekEpoch = this.state.selectedWeekEpoch;
        const nextWeekEpoch = this.state.selectedWeekEpoch +
            7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

        return (
            <div className="CalendarWeekSelect">
                <span className="LastWeek" onClick={() => this.handleWeekClick(true)}>
                    <img src={chevron} alt="Previous Week" className="flipped" />
                </span>
                <div className="CurrentWeek">
                    <span className="Date">
                        <span className="Month">
                            {this.getMonth(thisWeekEpoch)}
                        </span>
                        {' ' + this.getDay(thisWeekEpoch)}
                    </span>
                    -
                    <span className="Date">
                        <span className="Month">
                            {this.getMonth(nextWeekEpoch)}
                        </span>
                        {' ' + this.getDay(nextWeekEpoch)}
                    </span>
                </div>
                <span className="NextWeek" onClick={() => this.handleWeekClick(false)}>
                    <img src={chevron} alt="Next Week" />
                </span>
            </div>
        );
    }
}

export default CalendarWeekSelect;
