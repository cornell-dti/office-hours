import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from '../includes/ProfessorDelete';

class ProfessorCalendarTable extends React.Component {

    props: {
        taList: string[],
        // Array lengths are all 7
        // Index 0 == Monday... Index 6 == Sunday
        timeStart: number[][],
        timeEnd: number[][],
        taIndex: number[][],
        LocationBuilding: string[][],
        LocationRoomNum: string[][],
    };

    state: {
        isExpanded: boolean[][]
        isDeleteVisible: boolean
        currentDay: number
        currentRow: number
        dayIndex: number
        rowIndex: number
    }

    constructor(props: {}) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        var isExpandedInit = []
        for (var i = 0; i < 7; i++) {
            isExpandedInit.push(new Array<boolean>(this.props.timeStart[i].length).fill(false))
        }
        this.state = {
            isExpanded: isExpandedInit,
            isDeleteVisible: false,
            currentDay: 0,
            currentRow: 0,
            dayIndex: 0,
            rowIndex: 0
        };
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
        this.updateDeleteVisible = this.updateDeleteVisible.bind(this);
    }

    toggleEdit(day: number, row: number) {
        var cDay = this.state.currentDay;
        var cRow = this.state.currentRow;

        if (!(cDay == day && cRow == row)) {
            this.state.isExpanded[cDay][cRow] = false;
        }
        this.state.isExpanded[day][row] = !this.state.isExpanded[day][row];

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
        var tablewidth = 5;
        var dayIndex = this.state.dayIndex;
        var rowIndex = this.state.rowIndex;

        var rows = new Array(7);
        for (var i = 0; i < rows.length; i++) {
            rows[i] =
                <ProfessorCalendarRow
                    dayNumber={i}
                    taList={this.props.taList}
                    timeStart={this.props.timeStart[i]}
                    timeEnd={this.props.timeEnd[i]}
                    taIndex={this.props.taIndex[i]}
                    locationBuilding={this.props.LocationBuilding[i]}
                    locationRoomNum={this.props.LocationRoomNum[i]}
                    isExpanded={this.state.isExpanded[i]}
                    handleEditToggle={this.toggleEdit}
                    tablewidth={5}
                    updateDeleteInfo={this.updateDeleteInfo}
                    updateDeleteVisible={this.updateDeleteVisible}
                />
        }

        return (
            <div className="ProfessorCalendarTable">
                <ProfessorDelete
                    isDeleteVisible={this.state.isDeleteVisible}
                    updateDeleteVisible={this.updateDeleteVisible}
                    ta={this.props.taList[this.props.taIndex[dayIndex][rowIndex]]}
                    timeStart={this.props.timeStart[dayIndex][rowIndex]}
                    timeEnd={this.props.timeEnd[dayIndex][rowIndex]}
                    locationBuilding={this.props.LocationBuilding[dayIndex][rowIndex]}
                    locationRoomNum={this.props.LocationRoomNum[dayIndex][rowIndex]}
                />
                <table className="Calendar">
                    <tr>
                        <th colSpan={tablewidth}>Monday</th>
                    </tr>
                    {rows[0]}
                    <tr>
                        <th colSpan={tablewidth}>Tuesday</th>
                    </tr>
                    {rows[1]}
                    <tr>
                        <th colSpan={tablewidth}>Wednesday</th>
                    </tr>
                    {rows[2]}
                    <tr>
                        <th colSpan={tablewidth}>Thursday</th>
                    </tr>
                    {rows[3]}
                    <tr>
                        <th colSpan={tablewidth}>Friday</th>
                    </tr>
                    {rows[4]}
                    <tr>
                        <th colSpan={tablewidth}>Saturday</th>
                    </tr>
                    {rows[5]}
                    <tr>
                        <th colSpan={tablewidth}>Sunday</th>
                    </tr>
                    {rows[6]}
                </table>
            </div>
        );
    }
}

export default ProfessorCalendarTable;
