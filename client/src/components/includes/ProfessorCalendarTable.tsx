import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';

class ProfessorCalendarTable extends React.Component {

    props: {
        // Array lengths are all 7
        // Index 0 == Monday... Index 6 == Sunday
        taList: string[],
        timeStart: number[][],
        timeEnd: number[][],
        taIndex: number[][],
        LocationBuilding: string[][],
        LocationRoomNum: string[][],
    };

    render() {
        var tablewidth = 5;

        return (
            <div className="ProfessorCalendarTable">
                <table className="Calendar">
                    <tr>
                        <th colSpan={tablewidth}>Monday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        timeStart={this.props.timeStart[0]}
                        timeEnd={this.props.timeEnd[0]}
                        taIndex={this.props.taIndex[0]}
                        LocationBuilding={this.props.LocationBuilding[0]}
                        LocationRoomNum={this.props.LocationRoomNum[0]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Tuesday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        timeStart={this.props.timeStart[1]}
                        timeEnd={this.props.timeEnd[1]}
                        taIndex={this.props.taIndex[1]}
                        LocationBuilding={this.props.LocationBuilding[1]}
                        LocationRoomNum={this.props.LocationRoomNum[1]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Wednesday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        timeStart={this.props.timeStart[2]}
                        timeEnd={this.props.timeEnd[2]}
                        taIndex={this.props.taIndex[2]}
                        LocationBuilding={this.props.LocationBuilding[2]}
                        LocationRoomNum={this.props.LocationRoomNum[2]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Thursday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        timeStart={this.props.timeStart[3]}
                        timeEnd={this.props.timeEnd[3]}
                        taIndex={this.props.taIndex[3]}
                        LocationBuilding={this.props.LocationBuilding[3]}
                        LocationRoomNum={this.props.LocationRoomNum[3]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Friday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        timeStart={this.props.timeStart[4]}
                        timeEnd={this.props.timeEnd[4]}
                        taIndex={this.props.taIndex[4]}
                        LocationBuilding={this.props.LocationBuilding[4]}
                        LocationRoomNum={this.props.LocationRoomNum[4]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Saturday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        timeStart={this.props.timeStart[5]}
                        timeEnd={this.props.timeEnd[5]}
                        taIndex={this.props.taIndex[5]}
                        LocationBuilding={this.props.LocationBuilding[5]}
                        LocationRoomNum={this.props.LocationRoomNum[5]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Sunday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        timeStart={this.props.timeStart[5]}
                        timeEnd={this.props.timeEnd[5]}
                        taIndex={this.props.taIndex[5]}
                        LocationBuilding={this.props.LocationBuilding[5]}
                        LocationRoomNum={this.props.LocationRoomNum[5]}
                        tablewidth={tablewidth}
                    />
                </table>
            </div>
        );
    }
}

export default ProfessorCalendarTable;
