import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';

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
        currentDay: number
        currentRow: number
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
            currentDay: 0,
            currentRow: 0
        };
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

    render() {
        var tablewidth = 5;

        var rows = new Array(7);
        for (var i = 0; i < rows.length; i++) {
            rows[i] =
                <ProfessorCalendarRow
                    dayNumber={i}
                    taList={this.props.taList}
                    timeStart={this.props.timeStart[i]}
                    timeEnd={this.props.timeEnd[i]}
                    taIndex={this.props.taIndex[i]}
                    LocationBuilding={this.props.LocationBuilding[i]}
                    LocationRoomNum={this.props.LocationRoomNum[i]}
                    isExpanded={this.state.isExpanded[i]}
                    handleToggle={this.toggleEdit}
                    tablewidth={5}
                />
        }

        return (
            <div className="ProfessorCalendarTable">
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
