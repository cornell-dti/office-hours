import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from './ProfessorDelete';
import ProfessorOHInfoDelete from './ProfessorOHInfoDelete';

import { DropdownItemProps } from 'semantic-ui-react';

class ProfessorCalendarTable extends React.Component {
    props: {
        courseId: string,
        sessions: FireSession[]
        taOptions: DropdownItemProps[],
    };

    state: {
        isExpanded: boolean[][]
        isDeleteVisible: boolean
        currentDay: number
        currentRow: number
        dayIndex: number
        rowIndex: number
    };

    constructor(props: {}) {
        super(props);
        let isExpandedInit: boolean[][] = [];
        for (let i = 0; i < 7; i++) {
            isExpandedInit.push(new Array<boolean>(this.props.sessions.length).fill(false));
        }
        this.state = {
            isExpanded: isExpandedInit,
            isDeleteVisible: false,
            currentDay: 0,
            currentRow: 0,
            dayIndex: 0,
            rowIndex: 0,
        };
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
        this.updateDeleteVisible = this.updateDeleteVisible.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
    }

    componentWillReceiveProps(props: { sessions: FireSession[] }) {
        let isExpanded: boolean[][] = [];
        for (let i = 0; i < 7; i++) {
            isExpanded.push(new Array<boolean>(props.sessions.length).fill(false));
        }
        this.setState({ isExpanded: isExpanded });
    }

    toggleEdit(day: number, row: number, forceClose?: boolean) {
        let cDay = this.state.currentDay;
        let cRow = this.state.currentRow;

        if (!(cDay === day && cRow === row)) {
            this.state.isExpanded[cDay][cRow] = false;
        }

        if (forceClose) {
            this.state.isExpanded[day][row] = false;
        } else {
            this.state.isExpanded[day][row] = !this.state.isExpanded[day][row];
        }

        this.setState({
            isExpanded: this.state.isExpanded,
            currentDay: day,
            currentRow: row
        });
    }

    updateDeleteInfo(dayIndex: number, rowIndex: number) {
        this.setState({
            dayIndex: dayIndex,
            rowIndex: rowIndex
        });
    }

    updateDeleteVisible(toggle: boolean) {
        this.setState({
            isDeleteVisible: toggle
        });
    }

    render() {
        let sessions: FireSession[][] = [];
        for (let day = 0; day < 7; day++) {
            sessions.push(new Array<FireSession>());
        }

        this.props.sessions.forEach((node: FireSession) => {
            // 0 = Monday..., 5 = Saturday, 6 = Sunday
            let dayIndexQuery = (new Date(node.startTime.seconds).getDay() + 6) % 7;
            sessions[dayIndexQuery].push(node);
        });

        let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let headers = new Array(7);

        for (let index = 0; index < headers.length; index++) {
            headers[index] = (
                <tr>
                    <th colSpan={5}>{days[index]}</th>
                </tr>
            );
        }

        let rows = days.map(
            (dayName, i) => {
                return (
                    <React.Fragment key={i}>
                        <tbody>
                            <tr>
                                <th colSpan={5}>{dayName}</th>
                            </tr>
                        </tbody>
                        <ProfessorCalendarRow
                            key={i}
                            dayNumber={i}
                            sessions={sessions[i]}
                            courseId={this.props.courseId}
                            taOptions={this.props.taOptions}
                            isExpanded={this.state.isExpanded[i]}
                            handleEditToggle={this.toggleEdit}
                            updateDeleteInfo={this.updateDeleteInfo}
                            updateDeleteVisible={this.updateDeleteVisible}
                        />
                    </React.Fragment>
                );
            }
        );

        return (
            <div className="ProfessorCalendarTable">
                {sessions[this.state.dayIndex][this.state.rowIndex] &&
                    <ProfessorDelete
                        isDeleteVisible={this.state.isDeleteVisible}
                        updateDeleteVisible={this.updateDeleteVisible}
                        content={
                            <ProfessorOHInfoDelete
                                session={sessions[this.state.dayIndex][this.state.rowIndex]}
                                toggleDelete={() => this.updateDeleteVisible(false)}
                                toggleEdit={() => this.toggleEdit(this.state.currentDay, this.state.currentRow, true)}
                            />
                        }
                    />}
                <table className="Calendar">
                    {this.state.isExpanded[0]}
                    {rows}
                </table>
            </div>
        );
    }
}

export default ProfessorCalendarTable;
