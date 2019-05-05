import React, { useState } from 'react';
import moment from 'moment';
import 'moment-timezone';
import {
    Dropdown, Checkbox, Icon, DropdownItemProps, DropdownProps,
} from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProfessorOHInfo = (props: {
    session?: FireSession;
    courseId: string;
    isNewOH: boolean;
    taOptions: DropdownItemProps[];
    taUserIdsDefault?: number[];
    toggleEdit: Function;
    refreshCallback: Function;
}) => {
    const { session } = props;

    const [notification, setNotification] = useState(
        (session && moment(session.endTime.seconds * 1000).isBefore() && 'This session has already passed!') || '',
    );

    const updateNotification = (n: string) => {
        if (notification !== 'This session has already passed!') {
            setNotification(n);
        }
    };

    // const useInput = (defaultValue: string | undefined) => {
    //     const [input, setInput] = useState(defaultValue || '');
    //     const handleInputChange = (event: React.ChangeEvent<HTMLElement>) => {
    //         const target = event.target as HTMLTextAreaElement;
    //         setInput(target.value);
    //         updateNotification('');
    //     };
    //     return [input, setInput, handleInputChange];
    // };

    const [startTime, setStartTime] = useState(session && moment(session.startTime.seconds * 1000));
    const [endTime, setEndTime] = useState(session && moment(session.endTime.seconds * 1000));
    // TODO previously initialized to [undefined]
    const [taSelected, setTaSelected] = useState([undefined]);
    const [buildingSelected, setBuildingSelected] = useState(session && session.building);
    const [roomSelected, setRoomSelected] = useState(session && session.room);
    // TODO
    const [isSeriesMutation, setIsSeriesMuatation] = useState(false);
    const [title, setTitle] = useState((session && session.title) || '');

    // convertToUTC(time: moment.Moment | null | undefined) {
    //     if (time == null) {
    //         return undefined;
    //     } else {
    //         // Needs testing; depends on whether time zone info is sent or not
    //         // return time.tz('UTC', true);
    //         return time;
    //     }
    // }

    const handleTextField = (event: React.ChangeEvent<HTMLElement>, update: Function) => {
        const target = event.target as HTMLTextAreaElement;
        update(target.value);
        updateNotification('');
    };

    const handleStartTime = (newStartTime: moment.Moment) => {
        // Prevents end time from occuring before start time
        const newEndTime = moment(newStartTime).add(1, 'hours');
        setStartTime(newStartTime);
        setEndTime(newEndTime);

        updateNotification('');
    };

    const handleEndTime = (newEndTime: moment.Moment) => {
        setEndTime(newEndTime);
        updateNotification('');
    };

    const handleTaList = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, index: number) => {
        // taSelected[index] = Number(data.value) || undefined;
        // TODO
        setTaSelected(taSelected);
        updateNotification('');
    };

    const clearFields = () => {
        setStartTime(undefined);
        setEndTime(undefined);
        setTaSelected([undefined]);
        setBuildingSelected('');
        setRoomSelected('');
        setTitle('');
    };


    const filterUniqueTAs = (value: (number | undefined), index: number, self: (number | undefined)[]) => (
        value !== undefined && self.indexOf(value) === index);

    const incAddTA = () => {
        setTaSelected([...taSelected, undefined]);
    };

    const decAddTA = (index: number) => {
        taSelected.splice(index, 1);
        setTaSelected(taSelected);
    };

    let isMaxTA = false;
    // -1 to account for the "TA Name" placeholder
    if (taSelected.length >= props.taOptions.length - 1) {
        isMaxTA = true;
    }

    // Warning if fields are empty
    // Warning if end time (state) is in the past
    // Disable save button if default start time (prop) is in the past
    const disableEmpty = startTime == null || endTime == null;
    const disableState = endTime !== null && moment(endTime).isBefore();
    const disableProps = !(props.session == null) && moment(props.session.endTime).isBefore();

    const emptyNotification = 'Please fill in valid times';
    const stateNotification = 'End time has already passed!';

    const AddTA = taSelected.map(
        (ta, i) => (
            // TODO
            <div className={`AddTA ${i === 0 ? 'First' : 'Additional'}`} key={ta}>
                <Icon name="user" />
                <Dropdown
                    className="dropdown"
                    placeholder="TA Name"
                    selection
                    options={props.taOptions}
                    value={taSelected[i]}
                    onChange={(event, data) => handleTaList(event, data, i)}
                />
                {i === 0
                    ? (
                        <button
                            className={`AddTAButton ${isMaxTA}`}
                            disabled={isMaxTA}
                            onClick={() => incAddTA()}
                            type="button"
                        >
                            <Icon name="plus" />
                            Add TA
                        </button>
                    ) : (
                        <button
                            className="AddTAButton"
                            onClick={() => decAddTA(i)}
                            type="button"
                        >
                            <Icon name="x" />
                        </button>
                    )
                }
            </div>
        ),
    );

    return (
        <React.Fragment>
            <div className="ProfessorOHInfo">
                <div className="row">
                    <Icon name="marker" />
                    <input
                        className="long"
                        placeholder="Name"
                        value={title || ''}
                        onChange={(e) => handleTextField(e, setTitle)}
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
                        value={buildingSelected || ''}
                        onChange={(e) => handleTextField(e, setBuildingSelected)}
                    />
                    <input
                        className="shift"
                        placeholder="Room Number"
                        value={roomSelected || ''}
                        onChange={(e) => handleTextField(e, setRoomSelected)}
                    />
                </div>
                <div className="Time">
                    <Icon name="time" />
                    <div className="datePicker">
                        <DatePicker
                            selected={startTime}
                            onChange={handleStartTime}
                            dateFormat="dddd MM/DD/YY"
                            minDate={moment()}
                            placeholderText={moment().format('dddd MM/DD/YY')}
                            readOnly
                        />
                    </div>
                    <div className="datePicker timePicker shift">
                        <DatePicker
                            selected={startTime}
                            onChange={handleStartTime}
                            showTimeSelect
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="LT"
                            placeholderText="12:00 PM"
                            readOnly
                        />
                    </div>
                    <span className="shift">
                        To
                    </span>
                    <div className="datePicker timePicker shift">
                        <DatePicker
                            selected={endTime}
                            onChange={handleEndTime}
                            showTimeSelect
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly
                            timeIntervals={30}
                            dateFormat="LT"
                            minTime={startTime || moment().startOf('day')}
                            maxTime={moment().endOf('day')}
                            placeholderText="2:00 PM"
                            readOnly
                        />
                    </div>
                    <Checkbox
                        className="datePicker shift"
                        label={props.isNewOH ? 'Repeat weekly' : 'Edit all office hours in this series'}
                        checked={isSeriesMutation}
                        disabled={props.session ? props.session.sessionSeriesId === null : false}
                        onChange={() => setIsSeriesMuatation(!isSeriesMutation)}
                    />
                </div>
            </div>
            <div className="EditButtons">
                <button
                    className="Bottom Cancel"
                    onClick={() => props.toggleEdit()}
                    type="button"
                >
                    Cancel
                </button>
                {props.isNewOH
                    ? isSeriesMutation
                        ? (
                            <button
                                className="Bottom Edit"
                                type="button"
                                onClick={(e) => {
                                    if (disableEmpty) {
                                        updateNotification(emptyNotification);
                                    } else if (disableState) {
                                        updateNotification(stateNotification);
                                    } else {
                                        // _onClickCreateSeries(e, CreateSeries); TODO
                                        props.toggleEdit();
                                        clearFields();
                                    }
                                }}
                            >
                                Create
                            </button>
                        ) : (
                            <button
                                className="Bottom Edit"
                                type="button"
                                onClick={(e) => {
                                    if (disableEmpty) {
                                        updateNotification(emptyNotification);
                                    } else if (disableState) {
                                        updateNotification(stateNotification);
                                    } else {
                                        // _onClickCreateSession(e, CreateSession); TODO
                                        props.toggleEdit();
                                        clearFields();
                                    }
                                }}
                            >
                                Create
                            </button>
                        )

                    : isSeriesMutation
                        ? (
                            <button
                                className="Bottom Edit"
                                onClick={(e) => {
                                    if (disableEmpty) {
                                        updateNotification(emptyNotification);
                                    } else if (disableState) {
                                        updateNotification(stateNotification);
                                    } else {
                                        // _onClickEditSeries(e, EditSeries); TODO
                                        props.toggleEdit();
                                    }
                                }}
                                disabled={disableProps}
                                type="button"
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button
                                className="Bottom Edit"
                                onClick={(e) => {
                                    if (disableEmpty) {
                                        updateNotification(emptyNotification);
                                    } else if (disableState) {
                                        updateNotification(stateNotification);
                                    } else {
                                        // _onClickEditSession(e, EditSession); TODO
                                        props.toggleEdit();
                                    }
                                }}
                                disabled={disableProps}
                                type="button"
                            >
                                Save Changes
                            </button>
                        )
                }
                <span className="EditNotification">
                    {notification}
                </span>
            </div>
        </React.Fragment>
    );
};

export default ProfessorOHInfo;
