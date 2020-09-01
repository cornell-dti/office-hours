import * as React from 'react';
import { useState } from 'react';
import moment from 'moment';
import { Dropdown, Checkbox, Icon, DropdownItemProps, DropdownProps, Button } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { firestore, Timestamp } from '../../firebase';
import { createSeries, updateSeries } from '../../firebasefunctions';

enum Modality {
    VIRTUAL = 'virtual',
    HYBRID = 'hybrid',
    INPERSON = 'in-person'
}

const ProfessorOHInfo = (props: {
    session?: FireSession;
    courseId: string;
    isNewOH: boolean;
    taOptions: DropdownItemProps[];
    taUserIdsDefault?: number[];
    toggleEdit: Function;
}) => {
    const session = props.session || undefined;

    const [startTime, setStartTime] = useState<moment.Moment | undefined>();
    const [endTime, setEndTime] = useState<moment.Moment | undefined>();
    const [taSelected, setTaSelected] = useState<(string | undefined)[]>([]);
    const [locationBuildingSelected, setLocationBuildingSelected] = useState<string | undefined>();
    const [locationRoomNumSelected, setLocationRoomNumSelected] = useState<string | undefined>();
    const [isSeriesMutation, setIsSeriesMutation] = useState(false);
    const [notification, setNotification] = useState<string | undefined>();
    const [title, setTitle] = useState(session && session.title);
    const [modality, setModality] = useState(Modality.VIRTUAL);

    React.useEffect(() => {
        if (session) {
            setStartTime(moment(session.startTime.seconds * 1000));
            setEndTime(moment(session.endTime.seconds * 1000));
            setTaSelected(session.tas ? session.tas : [undefined]);
            if (session.modality !== "virtual") {
                setLocationBuildingSelected(session.building);
                setLocationRoomNumSelected(session.room);
            }
            setIsSeriesMutation(!!(session.sessionSeriesId));
            setNotification(
                moment(session.endTime).isBefore()
                    ? 'This session has already passed!'
                    : '');
            setTitle(session.title);
        }
    }, [session]);

    const updateNotification = (n: string) => {
        if (notification !== 'This session has already passed!') {
            setNotification(n);
        }
    };

    const handleStartTime = (currStartTime: moment.Moment) => {
        // Prevents end time from occuring before start time
        const newEndTime = moment(currStartTime).add(1, 'hours');
        setStartTime(currStartTime);
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
        setTaSelected(old => {
            const newArray = [...old];
            newArray[index] = String(data.value);
            return newArray;
        });
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

    /** A do-it-all function that can create/edit sessions/series. */
    const mutateSessionOrSeries = (): void => {
        const startMomentTime = startTime;
        if (startMomentTime === undefined) {
            return;
        }
        const startTimestamp = Timestamp.fromDate(startMomentTime.toDate());
        const endMomentTime = endTime;
        if (endMomentTime === undefined) {
            return;
        }
        const endTimestamp = Timestamp.fromDate(endMomentTime.toDate());
        if (locationBuildingSelected === undefined || locationRoomNumSelected === undefined) {
            return;
        }
        const propsSession = props.session;
        const taDocuments: string[] = [];
        taSelected.forEach(ta => {
            if (ta !== undefined) {
                taDocuments.push(ta);
            }
        });
        if (isSeriesMutation) {
            const series: FireSessionSeriesDefinition = {
                modality,
                building: locationBuildingSelected,
                courseId: props.courseId,
                endTime: endTimestamp,
                room: locationRoomNumSelected,
                startTime: startTimestamp,
                tas: taDocuments,
                title
            };
            if (propsSession) {
                const seriesId = propsSession.sessionSeriesId;
                if (seriesId === undefined) {
                    return;
                }
                updateSeries(firestore, seriesId, series);
            } else {
                createSeries(firestore, series);
            }
        } else {
            const sessionSeriesId = propsSession && propsSession.sessionSeriesId;
            const sessionWithoutSessionSeriesId = {
                modality,
                courseId: props.courseId,
                endTime: endTimestamp,
                startTime: startTimestamp,
                tas: taDocuments,
                title
            };
            const sessionLocation = modality !== Modality.VIRTUAL ? {
                building: locationBuildingSelected,
                room: locationRoomNumSelected,
            } : {};
            const newSession: Omit<FireSession, 'sessionId'> = sessionSeriesId === undefined
                ? sessionWithoutSessionSeriesId
                : { ...sessionWithoutSessionSeriesId, ...sessionLocation, sessionSeriesId };
            if (propsSession) {
                firestore.collection('sessions').doc(propsSession.sessionId).update(newSession);
            } else {
                firestore.collection('sessions').add(newSession);
            }
        }
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
        (ta, i) => {
            // Filter dropdown by checking if TA has not been selected yet
            // Include currently selected TA, or else dropdown can't prepopulate if option is missing
            const dropdownOptions = props.taOptions.filter(ta =>
                ta.value === taSelected[i] || !taSelected.some(s => s === ta.value));

            return (
                <div className={'AddTA ' + (i === 0 ? 'First' : 'Additional')} key={i}>
                    <Icon name="user" />
                    <Dropdown
                        className="dropdown"
                        placeholder="TA Name"
                        selection={true}
                        options={dropdownOptions}
                        value={taSelected[i]}
                        onChange={(event, data) => handleTaList(event, data, i)}
                    />
                    {i === 0 ?
                        <button
                            type="button"
                            className={'AddTAButton ' + isMaxTA}
                            disabled={isMaxTA}
                            onClick={() => incAddTA()}
                        >
                            <Icon name="plus" />
                            Add TA
                        </button> :
                        <button
                            type="button"
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
        <>
            <div className="ProfessorOHInfo">
                <div className="row">
                    Modality
                    <Button.Group>
                        <Button active={modality === Modality.VIRTUAL} onClick={() => setModality(Modality.VIRTUAL)}>Virtual</Button>
                        <Button active={modality === Modality.HYBRID} onClick={() => setModality(Modality.HYBRID)}>Hybrid</Button>
                        <Button active={modality === Modality.INPERSON} onClick={() => setModality(Modality.INPERSON)}>In Person</Button>
                    </Button.Group>
                </div>
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
                {modality !== Modality.VIRTUAL ? <div className="row">
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
                </div> : <></>}
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
                            timeIntervals={10}
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
                            timeIntervals={10}
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
                    type="button"
                    className="Bottom Cancel"
                    onClick={() => props.toggleEdit()}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="Bottom Edit"
                    onClick={() => {
                        if (disableEmpty) {
                            updateNotification(emptyNotification);
                        } else if (disableState) {
                            updateNotification(stateNotification);
                        } else {
                            mutateSessionOrSeries();
                            (props.isNewOH && clearFields());
                            props.toggleEdit();
                        }
                    }}
                    disabled={disableProps}
                >
                    {props.isNewOH ? 'Create' : 'Save Changes'}
                </button>
                <span className="EditNotification">
                    {notification}
                </span>
            </div>
        </>
    );
};

export default ProfessorOHInfo;
