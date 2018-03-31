import * as React from 'react';
import * as moment from 'moment';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react'
import { Checkbox } from 'semantic-ui-react'

class ProfessorCalendarRow extends React.Component {

    props: {
        taList: string[]
        timeStart: number[]
        timeEnd: number[]
        taIndex: number[]
        LocationBuilding: string[]
        LocationRoomNum: string[]
        tablewidth: number
    };

    state: {
        editVisible: boolean[];
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            editVisible: new Array<boolean>(this.props.timeStart.length).fill(false)
        };
    }

    toggleEdit(toggle: number) {
        this.state.editVisible[toggle] = !this.state.editVisible[toggle]
        this.setState({
            editVisible: this.state.editVisible
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
            taOptions.push({ value: current, text: current })
        }

        // Convert UNIX timestamps to readable time string
        var date = new Array<string>(this.props.timeStart.length);
        var timeStart = new Array<string>(this.props.timeStart.length);
        var timeEnd = new Array<string>(this.props.timeEnd.length);
        for (var i = 0; i < this.props.timeStart.length; i++) {
            date[i] = moment(this.props.timeStart[i]).format("dddd MM/DD/YY");
            timeStart[i] = moment(this.props.timeStart[i]).format("h:mm A");
            timeEnd[i] = moment(this.props.timeEnd[i]).format("h:mm A");
        }

        var rows = this.props.timeStart.map(
            (row, index) => {
                return (
                    <tbody className={'Pair ' + this.state.editVisible[index]}>
                        <tr className={'Preview ' + this.state.editVisible[index]}>
                            <td>{timeStart[index]} to {timeEnd[index]}</td>
                            <td>{this.props.taList[this.props.taIndex[index]]}</td>
                            <td>{this.props.LocationBuilding[index]} {this.props.LocationRoomNum[index]}</td>
                            <td>
                                <button className="Edit" onClick={() => this.toggleEdit(index)}>
                                    <i className="pencil icon" />
                                </button>
                            </td>
                            <td>
                                <button className="Delete">
                                    <i className="x icon" />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={this.props.tablewidth} className={'ExpandedEdit ' + this.state.editVisible[index]}>
                                <div className="InfoInput">
                                    <div className="TA">
                                        <i className="user icon" />
                                        <Dropdown className="dropdown" placeholder='TA Name' selection options={taOptions} defaultValue={taOptions[index].value} />
                                        <button className="AddTAButton">
                                            <i className="plus icon" />
                                            Add TA
                                        </button>
                                    </div>
                                    <div className="Location">
                                        <i className="marker icon" />
                                        <input className="long" value={this.props.LocationBuilding[index]} />
                                        <input value={this.props.LocationRoomNum[index]} />
                                    </div>
                                    <div className="Time">
                                        <i className="time icon" />
                                        <input value={date[index]} />
                                        <input value={timeStart[index]} />
                                        To
                                        <input value={timeEnd[index]} />
                                        <Checkbox className='repeat' label='Repeat Weekly' />
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
            rows
        );
    }
}

export default ProfessorCalendarRow;
