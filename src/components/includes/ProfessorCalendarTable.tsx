import * as React from 'react';
import { DropdownItemProps } from 'semantic-ui-react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from './ProfessorDelete';
import ProfessorOHInfoDelete from './ProfessorOHInfoDelete';

type Props = {
    courseId: string;
    course?: FireCourse;
    sessions: FireSession[];
    taOptions: DropdownItemProps[];
};

type State = {
    isExpanded: boolean[][];
    isDeleteVisible: boolean;
    currentDay: number;
    currentRow: number;
    dayIndex: number;
    rowIndex: number;
};

class ProfessorCalendarTable extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const isExpandedInit: boolean[][] = [];
        for (let i = 0; i < 7; i++) {
            isExpandedInit.push(new Array<boolean>(props.sessions.length).fill(false));
        }
        this.state = {
            isExpanded: isExpandedInit,
            isDeleteVisible: false,
            currentDay: 0,
            currentRow: 0,
            dayIndex: 0,
            rowIndex: 0,
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props === prevProps) {
            return;
        }
        const sessionsLength = this.props.sessions.length;
        const isExpanded: boolean[][] = [];
        for (let i = 0; i < 7; i++) {
            isExpanded.push(new Array<boolean>(sessionsLength).fill(false));
        }
        this.setState({ isExpanded });
    }

    toggleEdit = (day: number, row: number, forceClose?: boolean) => {
        const cDay = this.state.currentDay;
        const cRow = this.state.currentRow;

        const { isExpanded } = this.state;
        if (!(cDay === day && cRow === row)) {
            isExpanded[cDay][cRow] = false;
        }

        if (forceClose) {
            isExpanded[day][row] = false;
        } else {
            isExpanded[day][row] = !isExpanded[day][row];
        }

        this.setState({
            isExpanded,
            currentDay: day,
            currentRow: row
        });
    };

    updateDeleteInfo = (dayIndex: number, rowIndex: number) => {
        this.setState({ dayIndex, rowIndex });
    };

    updateDeleteVisible = (toggle: boolean) => {
        this.setState({
            isDeleteVisible: toggle
        });
    };

    render() {
        const sessions: FireSession[][] = [];
        for (let day = 0; day < 7; day++) {
            sessions.push([]);
        }

        this.props.sessions.forEach((node: FireSession) => {
            // 0 = Monday..., 5 = Saturday, 6 = Sunday
            const dayIndexQuery = (new Date(node.startTime.toDate()).getDay() + 6) % 7;
            sessions[dayIndexQuery].push(node);
        });

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const headers = new Array(7);

        for (let index = 0; index < headers.length; index++) {
            headers[index] = (
                <tr>
                    <th colSpan={5}>{days[index]}</th>
                </tr>
            );
        }

        const rows = days.map(
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
                            this.props.course ? <ProfessorOHInfoDelete
                                course={this.props.course}
                                session={sessions[this.state.dayIndex][this.state.rowIndex]}
                                toggleDelete={() => this.updateDeleteVisible(false)}
                                toggleEdit={() => this.toggleEdit(this.state.currentDay, this.state.currentRow, true)}
                            /> : <div />
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
