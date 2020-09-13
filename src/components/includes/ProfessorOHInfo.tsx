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
    const [taSelected, setTaSelected] = useState<{ id: string | null }[]>([]);
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
            setTaSelected(session.tas ? session.tas.map(ta => ({ id: ta })) : []);
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
            setModality(session.modality === "virtual" ? 
                Modality.VIRTUAL :session.modality === "hybrid" ? 
                    Modality.HYBRID : Modality.INPERSON);
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

    const handleTaList = (_event: React.SyntheticEvent<HTMLElement>, data: DropdownProps, index: number) => {
        setTaSelected(old => {
            const newArray = [...old];
            if (data.value) {
                newArray[index] = { id: data.value.toString() };
            }
            return newArray;
        });
        updateNotification('');
    };

    const clearFields = () => {
        setStartTime(undefined);
        setEndTime(undefined);
        setTaSelected([]);
        setLocationBuildingSelected('');
        setLocationRoomNumSelected('');
        setTitle('');
    };

    const incAddTA = () => {
        setTaSelected((old) => [...old, { id: null }]);
    };

    const decAddTA = (index: number) => {
        setTaSelected((old) => [
            ...old.slice(0, index),
            ...old.slice(index + 1)
        ]);
    };

    /** A do-it-all function that can create/edit sessions/series. */
    const mutateSessionOrSeries = React.useCallback((): Promise<void> => {
        const startMomentTime = startTime;
        if (startMomentTime === undefined) {
            return Promise.reject(new Error("No start time."));
        }
        const startTimestamp = Timestamp.fromDate(startMomentTime.toDate());
        const endMomentTime = endTime;
        if (endMomentTime === undefined) {
            return Promise.reject(new Error("No end time."));
        }
        const endTimestamp = Timestamp.fromDate(endMomentTime.toDate());

        const propsSession = props.session;
        const taDocuments: string[] = [];
        taSelected.forEach(ta => {
            if (ta && ta.id) {
                taDocuments.push(ta.id);
            }
        });
        if (isSeriesMutation) {
            let series: FireSessionSeriesDefinition;

            if (modality === Modality.VIRTUAL) {
                series = {
                    modality,
                    courseId: props.courseId,
                    endTime: endTimestamp,
                    startTime: startTimestamp,
                    tas: taDocuments,
                    title,
                }
            } else {
                if ((locationBuildingSelected === undefined || locationRoomNumSelected === undefined)) {
                    return Promise.reject(new Error("No location for non-virtual session."));
                }

                series = {
                    modality,
                    courseId: props.courseId,
                    endTime: endTimestamp,
                    startTime: startTimestamp,
                    tas: taDocuments,
                    title,
                    building: locationBuildingSelected,
                    room: locationRoomNumSelected,
                };
            }

            if (propsSession) {
                const seriesId = propsSession.sessionSeriesId;
                if (seriesId === undefined) {
                    return Promise.reject(new Error("No session id."));
                }
                return updateSeries(firestore, seriesId, series);
            }

            return createSeries(firestore, series);
        }

        const sessionSeriesId = propsSession && propsSession.sessionSeriesId;
    
        const sessionLocation = modality !== Modality.VIRTUAL ? {
            building: locationBuildingSelected || '',
            room: locationRoomNumSelected || '',
        } : {};
        const sessionWithoutSessionSeriesId = {
            modality,
            courseId: props.courseId,
            endTime: endTimestamp,
            startTime: startTimestamp,
            tas: taDocuments,
            title,
            ...sessionLocation
        };
        const newSession: Omit<FireSession, 'sessionId'> = sessionSeriesId === undefined
            ? sessionWithoutSessionSeriesId
            : { ...sessionWithoutSessionSeriesId, ...sessionLocation, sessionSeriesId };
        if (propsSession) {
            return firestore.collection('sessions').doc(propsSession.sessionId).update(newSession);
        }

        return firestore.collection('sessions').add(newSession).then(() => { });
    }, [
        endTime,
        isSeriesMutation,
        locationBuildingSelected,
        locationRoomNumSelected,
        modality,
        props.courseId,
        props.session,
        startTime,
        taSelected,
        title
    ]);

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

    const AddTA =
        (<div>
            <div>
                {taSelected.map(
                    (ta, i) => {
                        // Filter dropdown by checking if TA has not been selected yet
                        // Include currently selected TA, or else dropdown can't prepopulate if option is missing
                        const dropdownOptions = props.taOptions.filter(ta =>
                            ta.value === taSelected[i].id || !taSelected.some(s => s.id === ta.value));

                        return (
                            <div className={'AddTA ' + (i === 0 ? 'First' : 'Additional')} key={ta.id || i}>
                                <Icon name="user" />
                                <Dropdown
                                    className="dropdown"
                                    placeholder="TA Name"
                                    selection={true}
                                    options={dropdownOptions}
                                    value={ta.id === null ? undefined : ta.id}
                                    onChange={(event, data) => handleTaList(event, data, i)}
                                />
                                <button
                                    type="button"
                                    className="AddTAButton"
                                    onClick={() => decAddTA(i)}
                                >
                                    <Icon name="x" />
                                </button>

                            </div>
                        );
                    }
                )}
            </div>
            <button
                type="button"
                className={'AddTAButton ' + isMaxTA}
                disabled={isMaxTA}
                onClick={() => incAddTA()}
            >
                <Icon name="plus" />
                Add TA
            </button>
        </div>
        );

    return (
        <>
            <div className="ProfessorOHInfo">
                <div className="row">
                    Modality
                    <Button.Group className="ModalitySelector">
                        <Button
                            active={modality === Modality.VIRTUAL}
                            onClick={() => setModality(Modality.VIRTUAL)}
                        >
                            Virtual
                        </Button>
                        <Button
                            active={modality === Modality.HYBRID}
                            onClick={() => setModality(Modality.HYBRID)}
                        >
                            Hybrid
                        </Button>
                        <Button
                            active={modality === Modality.INPERSON}
                            onClick={() => setModality(Modality.INPERSON)}
                        >
                            In Person
                        </Button>
                    </Button.Group>
                </div>
                <div className="row">
                    <p className="description">
                        {
                            modality === Modality.VIRTUAL ? 
                                'In a virtual session each TA can provide their own "Virtual Location" '+
                                '(e.g. Zoom Link, Google Meet Link)' +
                                ' which is provided to the student when the TA is assigned to them.'
                                : modality === Modality.HYBRID ?
                                    'In a hybrid session the student can either provide a Zoom link'+
                                    ' or a physical location.'
                                    :
                                    'In an in-person session the student can provide their physical'
                                    + ' location (e.g. by the whiteboard).'
                        }
                    </p>
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
                    {(props.isNewOH || props.session?.sessionSeriesId != null) && <Checkbox
                        className="datePicker shift"
                        label={props.isNewOH ? 'Repeat weekly' : 'Edit all office hours in this series'}
                        checked={isSeriesMutation}
                        onChange={() => setIsSeriesMutation((old) => !old)}
                    />}
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
                            mutateSessionOrSeries().then(() => {
                                // eslint-disable-next-line no-console
                                console.log("Success!");
                            }).catch(err => {
                                // eslint-disable-next-line no-console
                                console.error(err);
                            }).finally(() => {
                                (props.isNewOH && clearFields());
                                props.toggleEdit();
                            });

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
