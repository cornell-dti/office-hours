import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNewOH from '../includes/ProfessorAddNewOH';
import ProfessorHeader from '../includes/ProfessorHeader';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

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
                />
                <div className="rightOfSidebar">
                    <ProfessorHeader
                        professor='Michael Clarkson'
                        image='https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg'
                        notification={true}
                    />
                    <div className='main'>
                        <ProfessorAddNewOH
                            taList={['Tiffany Wang', 'Joyelle Gilbert', 'Sophia Wang', 'Sean Kim', 'Zechen Zhang']}
                        />
                        <CalendarWeekSelect
                            handleClick={this.handleWeekClick}
                        />
                        <div className="Calendar">
                            <ProfessorCalendarTable
                                // taList={['Tiffany Wang', 'Joyelle Gilbert', 'Sophia Wang', 'Sean Kim', 'Zechen Zhang']}
                                // timeStart={[[1522684800000, 1522688400000, 1522695600000, 1522713600000], [1522764000000, 1522764000000, 1522789200000],
                                // [1522846800000, 1522850400000, 1522868400000, 1522872000000], [1522965600000, 1522965600000, 1522940400000], [],
                                // [1523120400000, 1523124000000, 1523134800000], [1523188800000, 1523199600000, 1523217600000]]}
                                // timeEnd={[[1522688400000, 1522692000000, 1522699200000, 1522717200000], [1522767600000, 1522767600000, 1522792800000],
                                // [1522854000000, 1522854000000, 1522872000000, 1522875600000], [1522969200000, 1522969200000, 1522990800000], [],
                                // [1523127600000, 1523131200000, 1523145600000], [1523192400000, 1523206800000, 1523228400000]]}
                                // taIndex={[[0, 1, 3, 4], [0, 2, 1], [0, 2, 1, 3], [2, 1, 0], [], [1, 2, 3], [0, 2, 1]]}
                                // LocationBuilding={[['Gates', 'Gates', 'Gates', 'Malott'], ['Upson', 'Upson', 'Duffield'],
                                // ['Duffield', 'Phillips', 'Plantations', 'TCAT'],
                                // ['Gates', 'Gates', 'Gates'], [], ['Upson', 'Clock Tower', 'Duffield'], ['Duffield', 'Phillips', 'Plantations']]}
                                // LocationRoomNum={[['G01', 'G02', 'G03', '122'], ['123', '234', '456'], ['123', '234', '456', 'Route 82'],
                                // ['G01', 'G02', 'G03'], [], ['123', '134th Step', '456'], ['123', '234', '456']]}

                                // courseId={this.props.match.params.courseId}
                                courseId={1}
                                beginTime={new Date(this.state.selectedWeekEpoch)}
                                endTime={new Date(this.state.selectedWeekEpoch +
                                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */)}
                                data={{}}
                                taList={['Tiffany Wang', 'Joyelle Gilbert', 'Sophia Wang', 'Sean Kim', 'Zechen Zhang']}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorView;
