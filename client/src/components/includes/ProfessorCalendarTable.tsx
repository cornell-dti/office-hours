import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';

class ProfessorCalendarTable extends React.Component {

    props: {
        taList: string[],
        mondayList: string[][],
        tuesdayList: string[][],
        wednesdayList: string[][],
        thursdayList: string[][],
        fridayList: string[][],
        saturdayList: string[][],
        sundayList: string[][]
    };

    render() {
        var tablewidth = this.props.mondayList.length + 2;

        return (
            <div className="ProfessorCalendarTable">
                <table className="Calendar">
                    <tr>
                        <th colSpan={tablewidth}>Monday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        time={this.props.mondayList[0]}
                        ta={this.props.mondayList[1]}
                        location={this.props.mondayList[2]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Tuesday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        time={this.props.tuesdayList[0]}
                        ta={this.props.tuesdayList[1]}
                        location={this.props.tuesdayList[2]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Wednesday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        time={this.props.wednesdayList[0]}
                        ta={this.props.wednesdayList[1]}
                        location={this.props.wednesdayList[2]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Thursday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        time={this.props.thursdayList[0]}
                        ta={this.props.thursdayList[1]}
                        location={this.props.thursdayList[2]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Friday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        time={this.props.fridayList[0]}
                        ta={this.props.fridayList[1]}
                        location={this.props.fridayList[2]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Saturday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        time={this.props.saturdayList[0]}
                        ta={this.props.saturdayList[1]}
                        location={this.props.saturdayList[2]}
                        tablewidth={tablewidth}
                    />
                    <tr>
                        <th colSpan={tablewidth}>Sunday</th>
                    </tr>
                    <ProfessorCalendarRow
                        taList={this.props.taList}
                        time={this.props.sundayList[0]}
                        ta={this.props.sundayList[1]}
                        location={this.props.sundayList[2]}
                        tablewidth={tablewidth}
                    />
                </table>
            </div>
        );
    }
}

export default ProfessorCalendarTable;
