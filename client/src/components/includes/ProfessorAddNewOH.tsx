import * as React from 'react';
import * as moment from 'moment';
import { Dropdown } from 'semantic-ui-react';
import { Checkbox } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react'
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

class ProfessorAddNewOH extends React.Component {

    props: {
        taList: string[]
    };

    state: {
        editVisible: boolean
        deleteVisible: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            editVisible: false,
            deleteVisible: false

        };
    }

    toggleEdit(toggle: boolean) {
        this.setState({
            editVisible: toggle
        });
    }

    toggleDelete(toggle: boolean) {
        this.setState({
            deleteVisible: toggle
        });
    }

    render() {
        var today = moment().format('ddd L');

        const taOptions = [];
        for (var i = 0; i < this.props.taList.length; i++) {
            var current = this.props.taList[i];
            taOptions.push({ value: current, text: current });
        }

        return (
            <div className="ProfessorAddNewOH">
                <div className="Delete">
                </div>
                <div className={'Add ' + !this.state.editVisible}>
                    <button className="NewOHButton" onClick={() => this.toggleEdit(true)}>
                        <Icon name="plus" />
                        Add New Office Hour
                    </button>
                </div>
                <div className={'ExpandedAdd ' + this.state.editVisible}>
                    <div className="NewOHHeader">
                        <button className="ExpandedNewOHButton" onClick={() => this.toggleEdit(false)}>
                            <Icon name="plus" />
                            Add New Office Hour
                        </button>
                    </div>
                    <div className="InfoInput">
                        <div className="TA">
                            <Icon name="user" />
                            <Dropdown className="dropdown" placeholder="TA Name" selection options={taOptions} />
                            <button className="AddTAButton">
                                <Icon name="plus" />
                                Add TA
                            </button>
                        </div>
                        <div className="Location">
                            <Icon name="marker" />
                            <input className="long" placeholder="Building/Location" />
                            <input placeholder="Room Number" />
                        </div>
                        <div className="Time">
                            <Icon name="time" />
                            <input placeholder={today} />
                            <input placeholder="12:00 PM" />
                            {/* <DatePicker
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                dateFormat="LT"
                                timeCaption="Time"
                            /> */}
                            To
                            <input placeholder="2:00 PM" />
                            <Checkbox className="repeat" label="Repeat Weekly" />
                        </div>
                    </div>
                    <div className="Buttons">
                        <button className="Create">
                            Create
                        </button>
                        <button className="Cancel" onClick={() => this.toggleEdit(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorAddNewOH;
