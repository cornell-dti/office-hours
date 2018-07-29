import * as React from 'react';
import * as moment from 'moment';
import 'moment-timezone';
import { Dropdown, Checkbox, Icon, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const EDIT_SESSION = gql`
    mutation EditSession($_sessionId: Int!, $_startTime: Datetime!, $_endTime : Datetime!, $_building: String!,
        $_room: String!, $_tas: [Int]) {
        apiEditSession(input: {_sessionId: $_sessionId, _startTime: $_startTime, 
            _endTime: $_endTime, _building: $_building, _room: $_room, _tas: $_tas }) {
                clientMutationId
        }
    }
`;

const EDIT_SERIES = gql`
    mutation EditSeries($_seriesId: Int!, $_startTime: Datetime!, $_endTime : Datetime!, $_building: String!,
        $_room: String!, $_tas: [Int]) {
        apiEditSeries(input: {_seriesId: $_seriesId, _startTime: $_startTime, 
            _endTime: $_endTime, _building: $_building, _room: $_room, _tas: $_tas }) {
            clientMutationId
        }
    }
`;

const CREATE_SESSION = gql`
    mutation CreateSession($_startTime: Datetime!, $_endTime : Datetime!, $_building: String!,
        $_room: String!, $_courseId: Int!, $_tas: [Int]) {
        apiCreateSession(input: {_startTime: $_startTime, _endTime: $_endTime, 
            _building: $_building, _room: $_room, _courseId: $_courseId, _tas: $_tas }) {
                clientMutationId
        }
    }
`;

const CREATE_SERIES = gql`
    mutation CreateSeries($_startTime: Datetime!, $_endTime : Datetime!, $_building: String!,
        $_room: String!, $_courseId: Int!, $_tas: [Int]) {
        apiCreateSeries(input: {_startTime: $_startTime, _endTime: $_endTime, 
            _building: $_building, _room: $_room, _courseId: $_courseId, _tas: $_tas }) {
                clientMutationId
        }
    }
`;

class ProfessorOHInfo extends React.Component {
    props: {
        courseId: number,
        isNewOH: boolean,
        taOptions: DropdownItemProps[],
        taUserIdsDefault?: number[],
        locationBuildingDefault?: string,
        locationRoomNumDefault?: string,
        startTimeDefault?: (moment.Moment | null),
        endTimeDefault?: (moment.Moment | null),
        sessionId?: number,
        sessionSeriesId?: number,
        toggleEdit: Function
    };

    state: {
        startTime?: (moment.Moment | null),
        endTime?: (moment.Moment | null),
        taSelected: (number | undefined)[],
        locationBuildingSelected?: string,
        locationRoomNumSelected?: string,
        isSeriesMutation: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            startTime: this.props.startTimeDefault,
            endTime: this.props.endTimeDefault,
            taSelected: this.props.taUserIdsDefault !== undefined ? this.props.taUserIdsDefault : [undefined],
            locationBuildingSelected: this.props.locationBuildingDefault,
            locationRoomNumSelected: this.props.locationRoomNumDefault,
            isSeriesMutation: this.props.sessionSeriesId !== null
        };

        this.handleStartTime = this.handleStartTime.bind(this);
        this.handleEndTime = this.handleEndTime.bind(this);
        this.handleBuilding = this.handleBuilding.bind(this);
        this.handleRoom = this.handleRoom.bind(this);
        this.handleTaList = this.handleTaList.bind(this);
        this.clearFields = this.clearFields.bind(this);
        this.incAddTA = this.incAddTA.bind(this);
        this.decAddTA = this.decAddTA.bind(this);
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
    }

    convertToUTC(time: moment.Moment | null | undefined) {
        if (time == null) {
            return undefined;
        } else {
            // Needs testing; depends on whether time zone info is sent or not
            // return time.tz('UTC', true);
            return time;
        }
    }

    _onClickCreateSession(event: React.MouseEvent<HTMLElement>, CreateSession: Function) {
        CreateSession({
            variables: {
                _startTime: this.convertToUTC(this.state.startTime),
                _endTime: this.convertToUTC(this.state.endTime),
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _courseId: this.props.courseId,
                _tas: this.state.taSelected.filter(index => index !== undefined)
            }
        });
    }

    _onClickCreateSeries(event: React.MouseEvent<HTMLElement>, CreateSeries: Function) {
        CreateSeries({
            variables: {
                _startTime: this.convertToUTC(this.state.startTime),
                _endTime: this.convertToUTC(this.state.endTime),
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _courseId: this.props.courseId,
                _tas: this.state.taSelected
            }
        });
    }

    _onClickEditSession(event: React.MouseEvent<HTMLElement>, EditSession: Function) {
        EditSession({
            variables: {
                _sessionId: this.props.sessionId,
                _startTime: this.convertToUTC(this.state.startTime),
                _endTime: this.convertToUTC(this.state.endTime),
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _tas: this.state.taSelected.filter(index => index !== undefined)
            }
        });
    }

    _onClickEditSeries(event: React.MouseEvent<HTMLElement>, EditSeries: Function) {
        EditSeries({
            variables: {
                _seriesId: this.props.sessionSeriesId,
                _startTime: this.convertToUTC(this.state.startTime),
                _endTime: this.convertToUTC(this.state.endTime),
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _tas: this.state.taSelected
            }
        });
    }

    handleStartTime(startTime: moment.Moment) {
        var newEndTime = moment(startTime);

        if (!(this.state.endTime == null)) {
            newEndTime.set({
                'hour': this.state.endTime.get('hour'),
                'minute': this.state.endTime.get('minute')
            });
            if (startTime.isAfter(newEndTime)) {
                newEndTime = moment(startTime);
            }
        }

        this.setState({
            startTime: startTime,
            endTime: newEndTime
        });
    }

    handleEndTime(endTime: moment.Moment) {
        this.setState({
            endTime: endTime
        });
    }

    handleBuilding(event: React.ChangeEvent<HTMLElement>) {
        const target = event.target as HTMLTextAreaElement;
        this.setState({
            locationBuildingSelected: target.value
        });
    }

    handleRoom(event: React.ChangeEvent<HTMLElement>) {
        const target = event.target as HTMLTextAreaElement;
        this.setState({
            locationRoomNumSelected: target.value
        });
    }

    handleTaList(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, index: number) {
        this.state.taSelected[index] = Number(data.value);
        this.setState({
            taSelected: this.state.taSelected
        });
    }

    clearFields() {
        this.setState({
            startTime: null,
            endTime: null,
            taSelected: [undefined],
            locationBuildingSelected: null,
            locationRoomNumSelected: null,
            isSeriesMutation: false
        });
    }

    incAddTA() {
        this.state.taSelected.push(undefined);
        this.setState({
            taSelected: this.state.taSelected
        });
    }

    decAddTA(index: number) {
        this.state.taSelected.splice(index, 1);
        this.setState({
            taSelected: this.state.taSelected
        });
    }

    toggleCheckbox() {
        this.setState({
            isSeriesMutation: !this.state.isSeriesMutation
        });
    }

    render() {
        var isMaxTA = false;
        if (this.state.taSelected.length >= this.props.taOptions.length) {
            isMaxTA = true;
        }

        var AddTA = this.state.taSelected.map(
            (ta, i) => {
                return (
                    <div className={'AddTA ' + (i === 0 ? 'First' : 'Additional')} key={i}>
                        <Icon name="user" />
                        <Dropdown
                            className="dropdown"
                            placeholder="TA Name"
                            selection={true}
                            options={this.props.taOptions}
                            value={this.state.taSelected[i]}
                            onChange={(event, data) => this.handleTaList(event, data, i)}
                        />
                        {i === 0 ?
                            <button
                                className={'AddTAButton ' + isMaxTA}
                                disabled={isMaxTA}
                                onClick={() => this.incAddTA()}
                            >
                                <Icon name="plus" />
                                Add TA
                            </button> :
                            <button
                                className="AddTAButton"
                                onClick={() => this.decAddTA(i)}
                            >
                                <Icon name="x" />
                            </button>
                        }
                    </div>
                );
            }
        );

        return (
            <React.Fragment>
                <div className="ProfessorOHInfo">
                    <div className="TA">
                        {AddTA}
                    </div>
                    <div className="Location">
                        <Icon name="marker" />
                        <input
                            className="long"
                            placeholder="Building/Location"
                            value={this.state.locationBuildingSelected || ''}
                            onChange={this.handleBuilding}
                        />
                        <input
                            className="shift"
                            placeholder="Room Number"
                            value={this.state.locationRoomNumSelected || ''}
                            onChange={this.handleRoom}
                        />
                    </div>
                    <div className="Time">
                        <Icon name="time" />
                        <div className="datePicker">
                            <DatePicker
                                selected={this.state.startTime}
                                onChange={this.handleStartTime}
                                dateFormat="dddd MM/DD/YY"
                                minDate={moment()}
                                placeholderText={moment().format('dddd MM/DD/YY')}
                            />
                        </div >
                        <div className="datePicker timePicker shift">
                            <DatePicker
                                selected={this.state.startTime}
                                onChange={this.handleStartTime}
                                showTimeSelect={true}
                                // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                                // Will not compile if removed
                                showTimeSelectOnly={true}
                                timeIntervals={30}
                                dateFormat="LT"
                                placeholderText="12:00 PM"
                            />
                        </div >
                        <span className="shift">
                            To
                    </span>
                        <div className="datePicker timePicker shift">
                            <DatePicker
                                selected={this.state.endTime}
                                onChange={this.handleEndTime}
                                showTimeSelect={true}
                                // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                                // Will not compile if removed
                                showTimeSelectOnly={true}
                                timeIntervals={30}
                                dateFormat="LT"
                                minTime={this.state.startTime || moment().startOf('day')}
                                maxTime={moment().endOf('day')}
                                placeholderText="2:00 PM"
                            />
                        </div >
                        <Checkbox
                            className="datePicker shift"
                            label={this.props.isNewOH ? 'Repeat Weekly' : 'Edit all Office Hours in this series'}
                            checked={this.state.isSeriesMutation}
                            disabled={this.props.sessionSeriesId === null}
                            onChange={this.toggleCheckbox}
                        />
                    </div>
                </div>
                <div className="EditButtons">
                    <button
                        className="Bottom Cancel"
                        onClick={() => this.props.toggleEdit()}
                    >
                        Cancel
                    </button>
                    {this.props.isNewOH ?
                        this.state.isSeriesMutation ?
                            <Mutation mutation={CREATE_SERIES}>
                                {(CreateSeries) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            this._onClickCreateSeries(e, CreateSeries);
                                            this.props.toggleEdit();
                                            this.clearFields();
                                        }}
                                    >
                                        Create
                                    </button>
                                }
                            </Mutation>
                            :
                            <Mutation mutation={CREATE_SESSION}>
                                {(CreateSession) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            this._onClickCreateSession(e, CreateSession);
                                            this.props.toggleEdit();
                                            this.clearFields();
                                        }}
                                    >
                                        Create
                                    </button>
                                }
                            </Mutation>

                        :
                        this.state.isSeriesMutation ?
                            <Mutation mutation={EDIT_SERIES}>
                                {(EditSeries) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            this._onClickEditSeries(e, EditSeries);
                                            this.props.toggleEdit();
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                }
                            </Mutation>
                            :
                            <Mutation mutation={EDIT_SESSION}>
                                {(EditSession) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            this._onClickEditSession(e, EditSession);
                                            this.props.toggleEdit();
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                }
                            </Mutation>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default ProfessorOHInfo;
