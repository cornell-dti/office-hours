import * as React from 'react';
import * as moment from 'moment';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfoessorOHInfo from './ProfessorOHInfo';

class ProfessorCalendarRow extends React.Component {

    props: {
        dayNumber: number
        taList: string[]
        timeStart: number[]
        timeEnd: number[]
        taIndex: number[]
        locationBuilding: string[]
        locationRoomNum: string[]
        isExpanded: boolean[]
        handleEditToggle: Function
        tablewidth: number
        updateDeleteInfo: Function
        updateDeleteVisible: Function
    };

    state: {
        startTime: (moment.Moment | null)[]
        endTime: (moment.Moment | null)[]
    };

    constructor(props: {}) {
        super(props);
        var timeStartMoment = [];
        var timeEndMoment = [];
        for (var i = 0; i < this.props.timeStart.length; i++) {
            timeStartMoment.push(moment(this.props.timeStart[i]));
            timeEndMoment.push(moment(this.props.timeEnd[i]));
        }

        this.state = {
            startTime: timeStartMoment,
            endTime: timeEndMoment
        };
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
        for (var i = 0; i < this.props.timeStart.length; i++) {
            date[i] = moment(this.props.timeStart[i]).format('dddd MM/DD/YY');
            timeStart[i] = moment(this.props.timeStart[i]).format('h:mm A');
            timeEnd[i] = moment(this.props.timeEnd[i]).format('h:mm A');
        }

        var rowPair = this.props.timeStart.map(
            (row, index) => {
                return (
                    <tbody className={'Pair ' + this.props.isExpanded[index]}>
                        <tr className="Preview">
                            <td>{timeStart[index]} to {timeEnd[index]}</td>
                            <td>{this.props.taList[this.props.taIndex[index]]}</td>
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
                                    taIndexDefault={this.props.taIndex[index]}
                                    locationBuildingDefault={this.props.locationBuilding[index]}
                                    locationRoomNumDefault={this.props.locationRoomNum[index]}
                                    startTimeDefault={this.state.startTime[index]}
                                    endTimeDefault={this.state.endTime[index]}
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
