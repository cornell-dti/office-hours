import * as React from 'react';
import { useState } from 'react';
import * as moment from 'moment';
import 'moment-timezone';
import { Dropdown, Checkbox, Icon, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProfessorOHInfo = (props: {
    session?: FireSession,
    courseId: string,
    isNewOH: boolean,
    taOptions: DropdownItemProps[],
    taUserIdsDefault?: number[],
    toggleEdit: Function,
}) => {
    const session = props.session || undefined;

    const [startTime, setStartTime] = useState<moment.Moment | undefined>
        (session && moment(session.startTime));
    const [endTime, setEndTime] = useState<moment.Moment | undefined>
        (session && moment(session.endTime));
    const [taSelected, setTaSelected] = useState<(string | undefined)[]>
        (session && session.tas
            ? session.tas.map(dRef => dRef.id)
            : []);
    const [locationBuildingSelected, setLocationBuildingSelected] = useState(session && session.building);
    const [locationRoomNumSelected, setLocationRoomNumSelected] = useState(session && session.room);
    const [isSeriesMutation, setIsSeriesMutation] = useState(!!(session && session.sessionSeriesId));
    const [notification, setNotification] = useState(
        session && moment(session.endTime).isBefore()
            ? 'This session has already passed!'
            : '');
    const [title, setTitle] = useState(session && session.title);

    const updateNotification = (n: string) => {
        if (notification !== 'This session has already passed!') {
            setNotification(n);
        }
    };

    const handleStartTime = (currStartTime: moment.Moment) => {
        // Prevents end time from occuring before start time
        const newEndTime = moment(currStartTime).add(1, 'hours');
        setEndTime(newEndTime);
        updateNotification('');
    };

    const handleEndTime = (newEndTime: moment.Moment) => {
        setEndTime(newEndTime);
        updateNotification('');
    };

    const handleTextField = (
        event: React.ChangeEvent<HTMLElement>,
        setStateFunction: React.Dispatch<React.SetStateAction<string | undefined>>
    ) => {
        const target = event.target as HTMLTextAreaElement;
        setStateFunction(target.value);
        updateNotification('');
    };

    const handleTaList = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, index: number) => {
        // Immutably update the value at index
        // tslint:disable-next-line: max-line-length
        // https://medium.com/@giltayar/immutably-setting-a-value-in-a-js-array-or-how-an-array-is-also-an-object-55337f4d6702
        setTaSelected(old => Object.assign([...old], { index: String(data.value) }));
        updateNotification('');
    };

    const clearFields = () => {
        setStartTime(undefined);
        setEndTime(undefined);
        setTaSelected([undefined]);
        setLocationBuildingSelected('');
        setLocationRoomNumSelected('');
        setTitle('');
    };

    const incAddTA = () => {
        setTaSelected((old) => [...old, undefined]);
    };

    const decAddTA = (index: number) => {
        setTaSelected((old) => [
            ...old.slice(0, index),
            ...old.slice(index + 1)
        ]);
    };

    let isMaxTA = false;
    // -1 to account for the "TA Name" placeholder
    if (taSelected.length >= props.taOptions.length - 1) {
        isMaxTA = true;
    }

    // Warning if fields are empty
    // Warning if end time (state) is in the past
    // Disable save button if default start time (prop) is in the past
    let disableEmpty = startTime == null || endTime == null;
    let disableState = endTime !== null && moment(endTime).isBefore();
    let disableProps = !(props.session == null) && moment(props.session.endTime).isBefore();

    const emptyNotification = 'Please fill in valid times';
    const stateNotification = 'End time has already passed!';

    let AddTA = taSelected.map(
        (ta, i) => {
            return (
                <div className={'AddTA ' + (i === 0 ? 'First' : 'Additional')} key={i}>
                    <Icon name="user" />
                    <Dropdown
                        className="dropdown"
                        placeholder="TA Name"
                        selection={true}
                        options={props.taOptions}
                        value={taSelected[i]}
                        onChange={(event, data) => handleTaList(event, data, i)}
                    />
                    {i === 0 ?
                        <button
                            className={'AddTAButton ' + isMaxTA}
                            disabled={isMaxTA}
                            onClick={() => incAddTA()}
                        >
                            <Icon name="plus" />
                            Add TA
                        </button> :
                        <button
                            className="AddTAButton"
                            onClick={() => decAddTA(i)}
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
                        value={locationBuildingSelected || ''}
                        onChange={(e) => handleTextField(e, setLocationBuildingSelected)}
                    />
                    <input
                        className="shift"
                        placeholder="Room Number"
                        value={locationRoomNumSelected || ''}
                        onChange={(e) => handleTextField(e, setLocationRoomNumSelected)}
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
                            readOnly={true}
                        />
                    </div >
                    <div className="datePicker timePicker shift">
                        <DatePicker
                            selected={startTime}
                            onChange={handleStartTime}
                            showTimeSelect={true}
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly={true}
                            timeIntervals={30}
                            dateFormat="LT"
                            placeholderText="12:00 PM"
                            readOnly={true}
                        />
                    </div >
                    <span className="shift">
                        To
                    </span>
                    <div className="datePicker timePicker shift">
                        <DatePicker
                            selected={endTime}
                            onChange={handleEndTime}
                            showTimeSelect={true}
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly={true}
                            timeIntervals={30}
                            dateFormat="LT"
                            minTime={startTime || moment().startOf('day')}
                            maxTime={moment().endOf('day')}
                            placeholderText="2:00 PM"
                            readOnly={true}
                        />
                    </div >
                    <Checkbox
                        className="datePicker shift"
                        label={props.isNewOH ? 'Repeat weekly' : 'Edit all office hours in this series'}
                        checked={isSeriesMutation}
                        disabled={props.session ? props.session.sessionSeriesId === null : false}
                        onChange={() => setIsSeriesMutation((old) => !old)}
                    />
                </div>
            </div>
            <div className="EditButtons">
                <button
                    className="Bottom Cancel"
                    onClick={() => props.toggleEdit()}
                >
                    Cancel
                </button>
                <button
                    className="Bottom Edit"
                    onClick={(e) => {
                        if (disableEmpty) {
                            updateNotification(emptyNotification);
                        } else if (disableState) {
                            updateNotification(stateNotification);
                        } else {
                            // If is new OH
                            // _onClickCreateSession(e, CreateSession);
                            clearFields();
                            // Else
                            // _onClickEditSession(e, () => 1);
                            props.toggleEdit();
                        }
                    }}
                    disabled={disableProps}
                >
                    Save Changes
                    {/* OR Create */}
                </button>
                <span className="EditNotification">
                    {notification}
                </span>
            </div>
        </React.Fragment>
    );
};

export default ProfessorOHInfo;
