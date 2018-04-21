import * as React from 'react';
import * as moment from 'moment';
import { Dropdown } from 'semantic-ui-react';
import { Checkbox } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

class ProfoessorOHInfo extends React.Component {

    props: {
        taList: string[]
        startDate?: moment.Moment
        startTime?: moment.Moment
        endTime?: moment.Moment
        taIndex?: number
        numAddTA: number
    };

    state: {
        startDate?: moment.Moment
        startTime?: moment.Moment
        endTime?: moment.Moment
        numAddTA: number
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            numAddTA: 0
        };
        this.handleDate = this.handleDate.bind(this);
        this.handleStartTime = this.handleStartTime.bind(this);
        this.handleEndTime = this.handleEndTime.bind(this);
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

    handleDate(date: moment.Moment) {
        this.setState({
            startDate: date
        });
    }

    handleStartTime(startTime: moment.Moment) {
        this.setState({
            startTime: startTime
        });
    }

    handleEndTime(endTime: moment.Moment) {
        this.setState({
            endTime: endTime
        });
    }

    incAddTA(inc: number) {
        this.setState({
            numAddTA: this.state.numAddTA + inc
        });
    }

    render() {
        var today = moment().format('dddd MM/DD/YY');

        const taOptions = [];
        for (var i = 0; i < this.props.taList.length; i++) {
            var current = this.props.taList[i];
            taOptions.push({ value: current, text: current });
        }

        var AddTA = [];
        for (var i = 0; i < this.state.numAddTA; i++) {
            var x = <div />
            if (i === this.state.numAddTA - 1) {
                x = <button className="AddTAButton" onClick={() => this.incAddTA(-1)}>
                    <Icon name="x" />
                </button>
            }

            AddTA.push(
                <div className="AddTA">
                    <Icon name="user" />
                    <Dropdown className="dropdown" placeholder="TA Name" selection options={taOptions} />
                    {x}
                </div>
            );
        }

        var isMaxTA = false;
        if (this.state.numAddTA >= 4) {
            isMaxTA = true;
        }

        var defaultValue = null;
        if (this.props.taIndex !== null) {
            defaultValue = taOptions[this.props.taIndex].value;
        }


        return (
            <div className="ProfessorOHInfo">
                <div className="TA">
                    <Icon name="user" />
                    <Dropdown className="dropdown" placeholder="TA Name" selection options={taOptions} defaultValue={taOptions[this.props.taIndex].value} />
                    <button className={'AddTAButton ' + isMaxTA} disabled={isMaxTA} onClick={() => this.incAddTA(1)}>
                        <Icon name="plus" />
                        Add TA
                    </button>
                </div>
                {AddTA}
                <div className="Location">
                    <Icon name="marker" />
                    <input className="long" placeholder="Building/Location" />
                    <input placeholder="Room Number" />
                </div>
                <div className="Time">
                    <Icon name="time" />
                    <div className="datePicker">
                        <DatePicker
                            selected={this.state.startDate}
                            onChange={this.handleDate}
                            dateFormat='dddd MM/DD/YY'
                            placeholderText={today}
                        />
                    </div >
                    <div className="datePicker">
                        <DatePicker
                            selected={this.state.startTime}
                            onChange={this.handleStartTime}
                            showTimeSelect
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="LT"
                            placeholderText="12:00 PM"
                        />
                    </div >
                    To
                    <div className="datePicker">
                        <DatePicker
                            selected={this.state.endTime}
                            onChange={this.handleEndTime}
                            showTimeSelect
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="LT"
                            placeholderText="2:00 PM"
                        />
                    </div >
                    <Checkbox className="repeat" label="Repeat Weekly" />
                </div>
            </div>
        );
    }
}

export default ProfoessorOHInfo;
