import * as React from 'react';
import * as moment from 'moment';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfoessorOHInfo from './ProfessorOHInfo';

class ProfessorCalendarRow extends React.Component {

    props: {
        dayNumber: number
        taList: string[]
        timeStart: Date[]
        timeEnd: Date[]
        taIndex: string[]
        locationBuilding: string[]
        locationRoomNum: string[]
        isExpanded: boolean[]
        handleEditToggle: Function
        tablewidth: number
        updateDeleteInfo: Function
        updateDeleteVisible: Function
    };

    constructor(props: {}) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
    }

    toggleEdit(row: number) {
        this.props.handleEditToggle(this.props.dayNumber, row);
    }

    updateDeleteInfo(dayIndex: number, rowIndex: number) {
        this.props.updateDeleteInfo(dayIndex, rowIndex);
        this.props.updateDeleteVisible(true);
    }

    render() {
        if (this.props.timeStart.length === 0) {
            return (
                <tr>
                    <td colSpan={this.props.tablewidth} className="NoOH">
                        <i>No office hours scheduled</i>
                    </td>
                </tr>
            );
        }

        // Convert UNIX timestamps to readable time string
        var date = new Array<string>(this.props.timeStart.length);
        var timeStart = new Array<string>(this.props.timeStart.length);
        var timeEnd = new Array<string>(this.props.timeEnd.length);
        for (var index = 0; index < this.props.timeStart.length; index++) {
            date[index] = moment(this.props.timeStart[index]).format('dddd MM/DD/YY');
            timeStart[index] = moment(this.props.timeStart[index]).format('h:mm A');
            timeEnd[index] = moment(this.props.timeEnd[index]).format('h:mm A');
        }

        var rowPair = this.props.timeStart.map(
            (row, index) => {
                return (
                    <tbody className={'Pair ' + this.props.isExpanded[index]}>
                        <tr className="Preview">
                            <td>{timeStart[index]} to {timeEnd[index]}</td>
                            <td>{this.props.taIndex[index]}</td>
                            <td>{this.props.locationBuilding[index]} {this.props.locationRoomNum[index]}</td>
                            <td>
                                <button className="Edit" onClick={() => this.toggleEdit(index)}>
                                    <Icon name="pencil" />
                                </button>
                            </td>
                            <td>
                                <button className="Delete" onClick={() => this.updateDeleteInfo(this.props.dayNumber, index)}>
                                    <Icon name="x" />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={this.props.tablewidth} className={'ExpandedEdit ' + this.props.isExpanded[index]}>
                                <ProfoessorOHInfo
                                    taList={this.props.taList}
                                    taDefault={this.props.taIndex[index]}
                                    locationBuildingDefault={this.props.locationBuilding[index]}
                                    locationRoomNumDefault={this.props.locationRoomNum[index]}
                                    startTimeDefault={moment(this.props.timeStart[index])}
                                    endTimeDefault={moment(this.props.timeEnd[index])}
                                />
                                <div className="EditButtons">
                                    <button className="Delete" onClick={() => this.updateDeleteInfo(this.props.dayNumber, index)}>
                                        Delete
                                    </button>
                                    <button className="Cancel" onClick={() => this.toggleEdit(index)}>
                                        Cancel
                                    </button>
                                    <button className="SaveChanges">
                                        Save Changes
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody >
                );
            }
        );

        return (
            rowPair
        );
    }
}

export default ProfessorCalendarRow;
