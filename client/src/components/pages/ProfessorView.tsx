import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import ProfessorHeader from '../includes/ProfessorHeader';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';
import ProfoessorOHInfo from '../includes/ProfessorOHInfo';
// import * as moment from 'moment';
import 'moment-timezone';

class ProfessorView extends React.Component {
    props: {
        match: {
            params: {
                courseId: number
            }
        }
    };

    state: {
        selectedWeekEpoch: number
    };

    constructor(props: {}) {
        super(props);
        var week = new Date();
        week.setHours(0, 0, 0, 0);
        week.setDate(week.getDate() + 1 - week.getDay());
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        this.state = {
            selectedWeekEpoch: week.getTime()
        };
        this.handleWeekClick = this.handleWeekClick.bind(this);
    }

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
    }

    render() {

        return (
            <div className="ProfessorView">
                <ProfessorSidebar
                    course="CS 1380"
                    selected={2}
                />
                <div className="rightOfSidebar">
                    <ProfessorHeader
                        professor="Michael Clarkson"
                        image="https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg"
                        notification={true}
                    />
                    <div className="main">
                        <ProfessorAddNew
                            text="Add New Office Hour"
                            content={
                                <ProfoessorOHInfo
                                    data={{}}
                                    courseId={this.props.match.params.courseId}
                                    isNewOH={true}
                                />
                            }
                        />
                        <CalendarWeekSelect
                            handleClick={this.handleWeekClick}
                        />
                        <div className="Calendar">
                            <ProfessorCalendarTable
                                _courseId={this.props.match.params.courseId}
                                _beginTime={new Date(this.state.selectedWeekEpoch)}
                                _endTime={new Date(this.state.selectedWeekEpoch +
                                    7 /* days */ * 24 /* hours */ * 60 /* minutes */
                                    * 60 /* seconds */ * 1000 /* millis */)}
                                data={{ loading: true }}
                                key={this.state.selectedWeekEpoch}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorView;
