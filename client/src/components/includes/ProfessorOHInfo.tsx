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
        $_room: String!, $_tas: [Int], $_title: String!) {
        apiEditSession( input: {
            _sessionId: $_sessionId,
            _startTime: $_startTime,
            _endTime: $_endTime,
            _building: $_building,
            _room: $_room,
            _tas: $_tas,
            _title: $_title
        }) {
            clientMutationId
        }
    }
`;

const EDIT_SERIES = gql`
    mutation EditSeries($_seriesId: Int!, $_startTime: Datetime!, $_endTime : Datetime!, $_building: String!,
        $_room: String!, $_tas: [Int], $_title: String!) {
        apiEditSeries( input: {
            _seriesId: $_seriesId,
            _startTime: $_startTime,
            _endTime: $_endTime,
            _building: $_building,
            _room: $_room,
            _tas: $_tas,
            _title: $_title
        }) {
            clientMutationId
        }
    }
`;

const CREATE_SESSION = gql`
    mutation CreateSession($_startTime: Datetime!, $_endTime : Datetime!, $_building: String!,
        $_room: String!, $_courseId: Int!, $_tas: [Int], $_title: String!) {
        apiCreateSession(input: {
            _startTime: $_startTime,
            _endTime: $_endTime,
            _building: $_building,
            _room: $_room,
            _courseId: $_courseId,
            _tas: $_tas,
            _title: $_title
        }) {
            clientMutationId
        }
    }
`;

const CREATE_SERIES = gql`
    mutation CreateSeries($_startTime: Datetime!, $_endTime : Datetime!, $_building: String!,
        $_room: String!, $_courseId: Int!, $_tas: [Int], $_title: String!) {
        apiCreateSeries(input: {
            _startTime: $_startTime,
            _endTime: $_endTime,
            _building: $_building,
            _room: $_room,
            _courseId: $_courseId,
            _tas: $_tas,
            _title: $_title
        }) {
                clientMutationId
        }
    }
`;

class ProfessorOHInfo extends React.Component {
    props: {
        session?: AppSession,
        courseId: number,
        isNewOH: boolean,
        taOptions: DropdownItemProps[],
        taUserIdsDefault?: number[],
        toggleEdit: Function,
        refreshCallback: Function,
    };

    state: {
        startTime?: (moment.Moment | null),
        endTime?: (moment.Moment | null),
        taSelected: (number | undefined)[],
        locationBuildingSelected?: string,
        locationRoomNumSelected?: string,
        isSeriesMutation: boolean,
        notification: string,
        title: string
    };

    constructor(props: {}) {
        super(props);

        if (this.props.session) { // Existing Session
            this.state = {
                startTime: moment(this.props.session.startTime),
                endTime: moment(this.props.session.endTime),
                taSelected: this.props.session.sessionTasBySessionId.nodes.length > 0 ?
                    this.props.session.sessionTasBySessionId.nodes.map(ta => ta.userByUserId.userId) : [undefined],
                locationBuildingSelected: this.props.session.building,
                locationRoomNumSelected: this.props.session.room,
                isSeriesMutation: this.props.session.sessionSeriesId !== null,
                notification: !(this.props.session == null) && moment(this.props.session.endTime).isBefore() ?
                    'This session has already passed!' : '',
                title: this.props.session.title
            };
        } else { // New Session
            this.state = {
                startTime: null,
                endTime: null,
                taSelected: [undefined],
                locationBuildingSelected: '',
                locationRoomNumSelected: '',
                isSeriesMutation: false,
                notification: '',
                title: ''
            };
        }

        this.handleStartTime = this.handleStartTime.bind(this);
        this.handleEndTime = this.handleEndTime.bind(this);
        this.handleTaList = this.handleTaList.bind(this);
        this.clearFields = this.clearFields.bind(this);
        this.updateNotification = this.updateNotification.bind(this);
        this.incAddTA = this.incAddTA.bind(this);
        this.decAddTA = this.decAddTA.bind(this);
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
        this.filterUniqueTAs = this.filterUniqueTAs.bind(this);
    }

    // convertToUTC(time: moment.Moment | null | undefined) {
    //     if (time == null) {
    //         return undefined;
    //     } else {
    //         // Needs testing; depends on whether time zone info is sent or not
    //         // return time.tz('UTC', true);
    //         return time;
    //     }
    // }
    _onClickCreateSession(event: React.MouseEvent<HTMLElement>, CreateSession: Function) {
        CreateSession({
            variables: {
                _startTime: this.state.startTime,
                _endTime: this.state.endTime,
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _courseId: this.props.courseId,
                _tas: this.state.taSelected.filter(this.filterUniqueTAs),
                _title: this.state.title
            }
        });
    }

    _onClickCreateSeries(event: React.MouseEvent<HTMLElement>, CreateSeries: Function) {
        CreateSeries({
            variables: {
                _startTime: this.state.startTime,
                _endTime: this.state.endTime,
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _courseId: this.props.courseId,
                _tas: this.state.taSelected.filter(this.filterUniqueTAs),
                _title: this.state.title
            }
        });
    }

    _onClickEditSession(event: React.MouseEvent<HTMLElement>, EditSession: Function) {
        EditSession({
            variables: {
                _sessionId: this.props.session && this.props.session.sessionId,
                _startTime: this.state.startTime,
                _endTime: this.state.endTime,
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _tas: this.state.taSelected.filter(this.filterUniqueTAs),
                _title: this.state.title
            }
        });
    }

    _onClickEditSeries(event: React.MouseEvent<HTMLElement>, EditSeries: Function) {
        EditSeries({
            variables: {
                _seriesId: this.props.session && this.props.session.sessionSeriesId,
                _startTime: this.state.startTime,
                _endTime: this.state.endTime,
                _building: this.state.locationBuildingSelected,
                _room: this.state.locationRoomNumSelected,
                _tas: this.state.taSelected.filter(this.filterUniqueTAs),
                _title: this.state.title
            }
        });
    }

    handleStartTime(startTime: moment.Moment) {
        // Prevents end time from occuring before start time
        var newEndTime = moment(startTime).add(1, 'hours');
        this.setState({
            startTime: startTime,
            endTime: newEndTime
        });
        this.updateNotification('');
    }

    handleEndTime(endTime: moment.Moment) {
        this.setState({
            endTime: endTime
        });
        this.updateNotification('');
    }

    handleTextField = (event: React.ChangeEvent<HTMLElement>, key: string) => {
        const target = event.target as HTMLTextAreaElement;
        this.setState({ [key]: target.value });
        this.updateNotification('');
    }

    handleTaList(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, index: number) {
        this.state.taSelected[index] = Number(data.value) || undefined;
        this.setState({ taSelected: this.state.taSelected });
        this.updateNotification('');
    }

    clearFields() {
        this.setState({
            startTime: null,
            endTime: null,
            taSelected: [undefined],
            locationBuildingSelected: '',
            locationRoomNumSelected: '',
            title: ''
        });
    }

    updateNotification(n: string) {
        if (this.state.notification !== 'This session has already passed!') {
            this.setState({
                notification: n
            });
        }
    }

    filterUniqueTAs(value: (number | undefined), index: number, self: (number | undefined)[]) {
        return value !== undefined && self.indexOf(value) === index;
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
        // -1 to account for the "TA Name" placeholder
        if (this.state.taSelected.length >= this.props.taOptions.length - 1) {
            isMaxTA = true;
        }

        // Warning if fields are empty
        // Warning if end time (state) is in the past
        // Disable save button if default start time (prop) is in the past
        var disableEmpty = this.state.startTime == null || this.state.endTime == null;
        var disableState = this.state.endTime !== null && moment(this.state.endTime).isBefore();
        var disableProps = !(this.props.session == null) && moment(this.props.session.endTime).isBefore();

        const emptyNotification = 'Please fill in valid times';
        const stateNotification = 'End time has already passed!';

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
                    <div className="row">
                        <Icon name="marker" />
                        <input
                            className="long"
                            placeholder="Name"
                            value={this.state.title || ''}
                            onChange={(e) => this.handleTextField(e, 'title')}
                        />
                    </div>
                    <div className="row TA">
                        {AddTA}
                    </div>
                    <div className="row">
                        <Icon name="marker" />
                        <input
                            className="long"
                            placeholder="Building/Location"
                            value={this.state.locationBuildingSelected || ''}
                            onChange={(e) => this.handleTextField(e, 'locationBuildingSelected')}
                        />
                        <input
                            className="shift"
                            placeholder="Room Number"
                            value={this.state.locationRoomNumSelected || ''}
                            onChange={(e) => this.handleTextField(e, 'locationRoomNumSelected')}
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
                                readOnly={true}
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
                                timeIntervals={10}
                                dateFormat="h:mm a"
                                placeholderText="12:00 PM"
                                readOnly={true}
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
                                timeIntervals={10}
                                dateFormat="LT"
                                minTime={this.state.startTime || moment().startOf('day')}
                                maxTime={moment().endOf('day')}
                                placeholderText="2:00 PM"
                                readOnly={true}
                            />
                        </div >
                        <Checkbox
                            className="datePicker shift"
                            label={this.props.isNewOH ? 'Repeat weekly' : 'Edit all office hours in this series'}
                            checked={this.state.isSeriesMutation}
                            disabled={this.props.session ? this.props.session.sessionSeriesId === null : false}
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
                            <Mutation mutation={CREATE_SERIES} onCompleted={() => this.props.refreshCallback()}>
                                {(CreateSeries) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            if (disableEmpty) {
                                                this.updateNotification(emptyNotification);
                                            } else if (disableState) {
                                                this.updateNotification(stateNotification);
                                            } else {
                                                this._onClickCreateSeries(e, CreateSeries);
                                                this.props.toggleEdit();
                                                this.clearFields();
                                            }
                                        }}
                                    >
                                        Create
                                    </button>
                                }
                            </Mutation>
                            :
                            <Mutation mutation={CREATE_SESSION} onCompleted={() => this.props.refreshCallback()}>
                                {(CreateSession) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            if (disableEmpty) {
                                                this.updateNotification(emptyNotification);
                                            } else if (disableState) {
                                                this.updateNotification(stateNotification);
                                            } else {
                                                this._onClickCreateSession(e, CreateSession);
                                                this.props.toggleEdit();
                                                this.clearFields();
                                            }
                                        }}
                                    >
                                        Create
                                    </button>
                                }
                            </Mutation>

                        :
                        this.state.isSeriesMutation ?
                            <Mutation mutation={EDIT_SERIES} onCompleted={() => this.props.refreshCallback()}>
                                {(EditSeries) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            if (disableEmpty) {
                                                this.updateNotification(emptyNotification);
                                            } else if (disableState) {
                                                this.updateNotification(stateNotification);
                                            } else {
                                                this._onClickEditSeries(e, EditSeries);
                                                this.props.toggleEdit();
                                            }
                                        }}
                                        disabled={disableProps}
                                    >
                                        Save Changes
                                    </button>
                                }
                            </Mutation>
                            :
                            <Mutation mutation={EDIT_SESSION} onCompleted={() => this.props.refreshCallback()}>
                                {(EditSession) =>
                                    <button
                                        className="Bottom Edit"
                                        onClick={(e) => {
                                            if (disableEmpty) {
                                                this.updateNotification(emptyNotification);
                                            } else if (disableState) {
                                                this.updateNotification(stateNotification);
                                            } else {
                                                this._onClickEditSession(e, EditSession);
                                                this.props.toggleEdit();
                                            }
                                        }}
                                        disabled={disableProps}
                                    >
                                        Save Changes
                                    </button>
                                }
                            </Mutation>
                    }
                    <span className="EditNotification">
                        {this.state.notification}
                    </span>
                </div>
            </React.Fragment>
        );
    }
}

export default ProfessorOHInfo;
