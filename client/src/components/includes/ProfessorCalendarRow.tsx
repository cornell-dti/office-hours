import * as React from 'react';
import * as moment from 'moment';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';
import { Checkbox } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
        this.handleStartTime = this.handleStartTime.bind(this);
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
    }

    toggleEdit(row: number) {
        this.props.handleEditToggle(this.props.dayNumber, row);
    }

    handleStartTime(index: number, date: moment.Moment | null) {
        this.state.startTime[index] = date;
        this.setState({
            startDate: this.state.startTime
        });
    }

    handleEndTime(index: number, date: moment.Moment | null) {
        this.state.endTime[index] = date;
        this.setState({
            startDate: this.state.endTime
        });
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

        // Create TA Dropdown items
        const taOptions = new Array<DropdownItemProps>();
        for (var i = 0; i < this.props.taList.length; i++) {
            var current = this.props.taList[i];
            taOptions.push({ value: current, text: current });
        }

        // Convert UNIX timestamps to readable time string
        var date = new Array<string>(this.props.timeStart.length);
        var timeStart = new Array<string>(this.props.timeStart.length);
        var timeEnd = new Array<string>(this.props.timeEnd.length);
        for (i = 0; i < this.props.timeStart.length; i++) {
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
                                <div className="InfoInput">
                                    <div className="TA">
                                        <Icon name="user" />
                                        <Dropdown className="dropdown" placeholder="TA Name" selection options={taOptions} defaultValue={taOptions[this.props.taIndex[index]].value} />
                                        <button className="AddTAButton">
                                            <Icon name="plus" />
                                            Add TA
                                        </button>
                                    </div>
                                    <div className="Location">
                                        <Icon name="marker" />
                                        <input className="long" defaultValue={this.props.locationBuilding[index]} />
                                        <input defaultValue={this.props.locationRoomNum[index]} />
                                    </div>
                                    <div className="Time">
                                        <Icon name="time" />
                                        <div className="datePicker">
                                            <DatePicker
                                                selected={this.state.startTime[index]}
                                                onChange={(d) => this.handleStartTime(index, d)}
                                                dateFormat="dddd MM/DD/YY"
                                            />
                                        </div>
                                        <div className="datePicker">
                                            <DatePicker
                                                selected={this.state.startTime[index]}
                                                onChange={(d) => this.handleStartTime(index, d)}
                                                showTimeSelect
                                                // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                                                // Will not compile if removed
                                                showTimeSelectOnly
                                                timeIntervals={30}
                                                dateFormat="LT"
                                            />
                                        </div >
                                        To
                                        <div className="datePicker">
                                            <DatePicker
                                                selected={this.state.endTime[index]}
                                                onChange={(d) => this.handleEndTime(index, d)}
                                                showTimeSelect
                                                // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                                                // Will not compile if removed
                                                showTimeSelectOnly
                                                timeIntervals={30}
                                                dateFormat="LT"
                                            />
                                        </div >
                                        <Checkbox className="repeat" label="Repeat Weekly" />
                                    </div>
                                </div>
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
