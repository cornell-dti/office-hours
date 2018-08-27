import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from './ProfessorDelete';
import ProfessorOHInfoDelete from './ProfessorOHInfoDelete';

import { DropdownItemProps } from 'semantic-ui-react';

class ProfessorCalendarTable extends React.Component {
    state: {
        isExpanded: boolean[][]
        isDeleteVisible: boolean
        currentDay: number
        currentRow: number
        dayIndex: number
        rowIndex: number
    };

    props: {
        data: {
            nodes: [AppSession]
        },
        taOptions: DropdownItemProps[],
        refreshCallback: Function,
        courseId: number
    };

    constructor(props: {}) {
        super(props);
        var isExpandedInit: boolean[][] = [];
        for (var i = 0; i < 7; i++) {
            isExpandedInit.push(new Array<boolean>(this.props.data.nodes.length).fill(false));
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

    componentWillReceiveProps(props: { data: { nodes: [AppSession] } }) {
        var isExpanded: boolean[][] = [];
        for (var i = 0; i < 7; i++) {
            isExpanded.push(new Array<boolean>(props.data.nodes.length).fill(false));
        }
        this.setState({ isExpanded: isExpanded });
    }

    toggleEdit(day: number, row: number, forceClose?: boolean) {
        var cDay = this.state.currentDay;
        var cRow = this.state.currentRow;

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
        var timeStart: Date[][] = [];
        var timeEnd: Date[][] = [];
        var taNames: Array<string[][]> = [];
        var taUserIds: Array<number[][]> = [];
        var building: string[][] = [];
        var room: string[][] = [];
        var sessionId: number[][] = [];
        var sessionSeriesId: number[][] = [];
        var titles: string[][] = [];

        for (var day = 0; day < 7; day++) {
            timeStart.push(new Array<Date>());
            timeEnd.push(new Array<Date>());
            taNames.push(new Array<string[]>());
            taUserIds.push(new Array<number[]>());
            building.push(new Array<string>());
            room.push(new Array<string>());
            sessionId.push(new Array<number>());
            sessionSeriesId.push(new Array<number>());
            titles.push(new Array<string>());
        }

        this.props.data.nodes.forEach((node: AppSession) => {
            // 0 = Monday..., 5 = Saturday, 6 = Sunday
            var dayIndexQuery = (new Date(node.startTime).getDay() + 6) % 7;
            var taNamesQuery: string[] = [];
            var taUserIdsQuery: number[] = [];
            node.sessionTasBySessionId.nodes.forEach((ta) => {
                taNamesQuery.push(ta.userByUserId.computedName);
                taUserIdsQuery.push(ta.userByUserId.userId);
            });

            timeStart[dayIndexQuery].push(new Date(node.startTime));
            timeEnd[dayIndexQuery].push(new Date(node.endTime));
            building[dayIndexQuery].push(node.building);
            room[dayIndexQuery].push(node.room);
            taNames[dayIndexQuery].push(taNamesQuery);
            taUserIds[dayIndexQuery].push(taUserIdsQuery);
            sessionId[dayIndexQuery].push(node.sessionId);
            sessionSeriesId[dayIndexQuery].push(node.sessionSeriesId);
            titles[dayIndexQuery].push(node.title);
        });

        var tablewidth = 5;
        var dayIndex = this.state.dayIndex;
        var rowIndex = this.state.rowIndex;

        var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        var headers = new Array(7);

        for (var index = 0; index < headers.length; index++) {
            headers[index] = (
                <tr>
                    <th colSpan={tablewidth}>{days[index]}</th>
                </tr>
            );
        }

        var rows = days.map(
            (dayName, i) => {
                return (
                    <React.Fragment key={i}>
                        <tbody>
                            <tr>
                                <th colSpan={tablewidth}>{dayName}</th>
                            </tr>
                        </tbody>
                        <ProfessorCalendarRow
                            key={i}
                            courseId={this.props.courseId}
                            taOptions={this.props.taOptions}
                            timeStart={timeStart[i]}
                            timeEnd={timeEnd[i]}
                            taNames={taNames[i]}
                            taUserIds={taUserIds[i]}
                            locationBuilding={building[i]}
                            locationRoomNum={room[i]}
                            sessionId={sessionId[i]}
                            sessionSeriesId={sessionSeriesId[i]}
                            tablewidth={5}
                            dayNumber={i}
                            isExpanded={this.state.isExpanded[i]}
                            handleEditToggle={this.toggleEdit}
                            updateDeleteInfo={this.updateDeleteInfo}
                            updateDeleteVisible={this.updateDeleteVisible}
                            refreshCallback={this.props.refreshCallback}
                            titles={titles[i]}
                        />
                    </React.Fragment>
                );
            }
        );

        return (
            <div className="ProfessorCalendarTable">
                <ProfessorDelete
                    isDeleteVisible={this.state.isDeleteVisible}
                    updateDeleteVisible={this.updateDeleteVisible}
                    content={
                        <ProfessorOHInfoDelete
                            ta={taNames[dayIndex][rowIndex]}
                            timeStart={timeStart[dayIndex][rowIndex]}
                            timeEnd={timeEnd[dayIndex][rowIndex]}
                            locationBuilding={building[dayIndex][rowIndex]}
                            locationRoomNum={room[dayIndex][rowIndex]}
                            sessionId={sessionId[dayIndex][rowIndex]}
                            sessionSeriesId={sessionSeriesId[dayIndex][rowIndex]}
                            toggleDelete={() => this.updateDeleteVisible(false)}
                            toggleEdit={() => this.toggleEdit(this.state.currentDay, this.state.currentRow, true)}
                            refreshCallback={this.props.refreshCallback}
                        />
                    }
                />
                <table className="Calendar">
                    {this.state.isExpanded[0]}
                    {rows}
                </table>
            </div>
        );
    }
}

export default ProfessorCalendarTable;
