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
        LocationBuilding: string[]
        LocationRoomNum: string[]
        isExpanded: boolean[]
        handleToggle: Function
        tablewidth: number
    };

    state: {
        startDate: (moment.Moment | null)[]
    };

    constructor(props: {}) {
        super(props);
        var timeStartMoment = [];
        for (var i = 0; i < this.props.timeStart.length; i++) {
            timeStartMoment.push(moment(this.props.timeStart[i]));
        }

        this.state = {
            startDate: timeStartMoment
        };
        this.toggleEdit = this.toggleEdit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    toggleEdit(row: number) {
        this.props.handleToggle(this.props.dayNumber, row);
    }

    handleChange(index: number, date: moment.Moment | null) {
        this.state.startDate[index] = date;
        this.setState({
            startDate: this.state.startDate
        });
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
                            <td>{this.props.LocationBuilding[index]} {this.props.LocationRoomNum[index]}</td>
                            <td>
                                <button className="Edit" onClick={() => this.toggleEdit(index)}>
                                    <Icon name="pencil" />
                                </button>
                            </td>
                            <td>
                                <button className="Delete">
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
                                        <input className="long" defaultValue={this.props.LocationBuilding[index]} />
                                        <input defaultValue={this.props.LocationRoomNum[index]} />
                                    </div>
                                    <div className="Time">
                                        <Icon name="time" />
                                        <div className="datePicker">
                                            <DatePicker
                                                selected={this.state.startDate[index]}
                                                onChange={(d) => this.handleChange(index, d)}
                                                dateFormat="dddd MM/DD/YY"
                                            />
                                        </div>
                                        <input defaultValue={timeStart[index]} />
                                        To
                                        <input defaultValue={timeEnd[index]} />
                                        <Checkbox className="repeat" label="Repeat Weekly" />
                                    </div>
                                </div>
                                <div className="EditButtons">
                                    <button className="Delete">
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
