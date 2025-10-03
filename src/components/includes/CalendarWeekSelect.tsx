import * as React from 'react';
import chevron from '../../media/chevron.svg';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

type Props = {
    handleClick?: (previousWeek: boolean) => void;
    selectedWeekEpoch?: number;
};
type State = { selectedWeekEpoch: number };

class CalendarWeekSelect extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        if (props.selectedWeekEpoch) {
            this.state = {
                selectedWeekEpoch: props.selectedWeekEpoch,
            };
        } else {
            const week = new Date();
            week.setHours(0, 0, 0, 0);
            const daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
            week.setDate(week.getDate() - daysSinceMonday); // beginning of this week's Monday as a Date, not Time
            this.state = {
                selectedWeekEpoch: week.getTime()
            };
        }
        this.handleWeekClick = this.handleWeekClick.bind(this);
    }

    static getMonth(epoch: number): string {
        const now = new Date(epoch);
        return monthNames[now.getMonth()];
    }

    static getDay(epoch: number): number {
        const now = new Date(epoch);
        return now.getDate();
    }

    // previousWeek = true means that the previous week was clicked in the week selector
    // previousWeek = false means that the next week was clicked in the week selector
    handleWeekClick(previousWeek: boolean) {
        const d = new Date(this.state.selectedWeekEpoch);
        d.setDate(d.getDate() + (previousWeek ? -7 : 7));
        this.setState({
            selectedWeekEpoch: d.getTime()
        });
        if (this.props.handleClick !== undefined) {
            this.props.handleClick(previousWeek);
        }
    }

    render() {

        const thisWeekEpoch = this.state.selectedWeekEpoch;
      
        const nextWeekEpoch = this.state.selectedWeekEpoch +
            6 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

        return (
            <div className="CalendarWeekSelect">
                <span className="LastWeek" onClick={() => this.handleWeekClick(true)}>
                    <img src={chevron} alt="Previous Week" className="flipped" />
                </span>
                <div className="CurrentWeek">
                    <span className="Date">
                        <span className="Month">
                            {CalendarWeekSelect.getMonth(thisWeekEpoch)}
                        </span>
                        {' ' + CalendarWeekSelect.getDay(thisWeekEpoch)}
                    </span>
                    -
                    <span className="Date">
                        <span className="Month">
                            {CalendarWeekSelect.getMonth(nextWeekEpoch)}
                        </span>
                        {' ' + CalendarWeekSelect.getDay(nextWeekEpoch)}
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
