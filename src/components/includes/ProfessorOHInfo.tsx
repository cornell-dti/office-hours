import * as React from 'react';
import { useState } from 'react';
import moment from 'moment';
import {
    Dropdown,
    Checkbox,
    Icon,
    DropdownItemProps,
    DropdownProps,
    Button,
} from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { firestore, Timestamp } from '../../firebase';
import { createSeries, updateSeries } from '../../firebasefunctions/series';
import { addSession, updateSession } from '../../firebasefunctions/session';

enum Modality {
    VIRTUAL = 'virtual',
    HYBRID = 'hybrid',
    INPERSON = 'in-person',
    REVIEW = 'review',
}

const defaultTitle = "Office Hours";

class OHMutateError extends Error {}

const ProfessorOHInfo = (props: {
    session?: FireSession;
    courseId: string;
    isNewOH: boolean;
    taOptions: DropdownItemProps[];
    // taUserIdsDefault?: number[];
    toggleEdit: Function;
    isOfficeHour: boolean;
}) => {
    const session = props.session || undefined;

    const [startTime, setStartTime] = useState<moment.Moment | undefined>();
    const [endTime, setEndTime] = useState<moment.Moment | undefined>();
    const [taSelected, setTaSelected] = useState<{ id: string | null }[]>([]);
    const [locationBuildingSelected, setLocationBuildingSelected] = useState<
    string | undefined
    >();
    const [locationRoomNumSelected, setLocationRoomNumSelected] = useState<
    string | undefined
    >();
    const [zoomLink, setZoomLink] = useState<string | undefined>();
    const [isSeriesMutation, setIsSeriesMutation] = useState(false);
    const [notification, setNotification] = useState<string | undefined>();
    const [title, setTitle] = useState(session && session.title);
    const [modality, setModality] = useState(
        props.isOfficeHour ? Modality.VIRTUAL : Modality.REVIEW
    );
    const [useTALink, setUseTALink] = useState(session && 
        (session.modality === "virtual" || session.modality === "hybrid") ? session.useTALink :false);
    const [TALink, setTALink] = useState(
        session && (session.modality === "virtual" || session.modality === "hybrid") ? session.TALink || "" : ""
    );

    React.useEffect(() => {
        if (session) {
            setStartTime(moment(session.startTime.seconds * 1000));
            setEndTime(moment(session.endTime.seconds * 1000));
            setTaSelected(
                session.tas ? session.tas.map((ta) => ({ id: ta })) : []
            );
            if ('building' in session) {
                setLocationBuildingSelected(session.building);
                setLocationRoomNumSelected(session.room);
            }
            setIsSeriesMutation(!!session.sessionSeriesId);
            setNotification(
                moment(session.endTime).isBefore()
                    ? 'This session has already passed!'
                    : ''
            );
            setTitle(session.title);
            setModality(
                session.modality === 'virtual'
                    ? Modality.VIRTUAL
                    : session.modality === 'review'
                        ? Modality.REVIEW
                        : session.modality === 'hybrid'
                            ? Modality.HYBRID
                            : Modality.INPERSON
            );
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
        setStateFunction: React.Dispatch<
        React.SetStateAction<string | undefined>
        >
    ) => {
        const target = event.target as HTMLTextAreaElement;
        setStateFunction(target.value);
        updateNotification('');
    };

    const handleTaList = (
        _event: React.SyntheticEvent<HTMLElement>,
        data: DropdownProps,
        index: number
    ) => {
        setTaSelected((old) => {
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
            ...old.slice(index + 1),
        ]);
    };

    /** A do-it-all function that can create/edit sessions/series. */
    const mutateSessionOrSeries = React.useCallback((): Promise<void> => {
        const startMomentTime = startTime;
        if (startMomentTime === undefined) {
            return Promise.reject(new OHMutateError('No start time selected.'));
        }
        const startTimestamp = Timestamp.fromDate(startMomentTime.toDate());
        const endMomentTime = endTime;
        if (endMomentTime === undefined) {
            return Promise.reject(new OHMutateError('No end time selected.'));
        }
        const endTimestamp = Timestamp.fromDate(endMomentTime.toDate());

        const finalTitle = title || defaultTitle;

        if (
            (modality === Modality.REVIEW &&
            (!zoomLink ||
                (zoomLink.indexOf('http://') === -1 &&
                    zoomLink.indexOf('https://') === -1))) || 
                    (useTALink && (!TALink || (TALink.indexOf('http://') === -1 &&
                    TALink.indexOf('https://') === -1)))
        ) {
            return Promise.reject(new OHMutateError('Not a valid zoom link! Links must be prepending with https://'));
        }
        const propsSession = props.session;
        const taDocuments: string[] = [];
        taSelected.forEach((ta) => {
            if (ta && ta.id) {
                taDocuments.push(ta.id);
            }
        });
        if (isSeriesMutation) {
            let series: FireSessionSeriesDefinition;
            if (modality === Modality.VIRTUAL) {
                series = {
                    useTALink,
                    TALink,
                    modality,
                    courseId: props.courseId,
                    endTime: endTimestamp,
                    startTime: startTimestamp,
                    tas: taDocuments,
                    title: finalTitle,
                };
            } else if (modality === Modality.REVIEW) {
                if (zoomLink === undefined) {
                    return Promise.reject(
                        new OHMutateError('Not a valid link!')
                    );
                }
                series = {
                    modality,
                    courseId: props.courseId,
                    endTime: endTimestamp,
                    startTime: startTimestamp,
                    tas: taDocuments,
                    title: finalTitle,
                    link: zoomLink,
                };
            } else {
                if (modality === Modality.INPERSON) {
                    if (!locationBuildingSelected) {
                        return Promise.reject(
                            new OHMutateError('No building provided!')
                        );
                    }

                    if (!locationRoomNumSelected) {
                        return Promise.reject(
                            new OHMutateError('No room provided!')
                        );
                    }
                }

                let hybridProperties = {}

                if (modality === Modality.HYBRID) {
                    hybridProperties = {
                        useTALink,
                        TALink
                    }
                }

                series = {
                    ...hybridProperties,
                    modality,
                    courseId: props.courseId,
                    endTime: endTimestamp,
                    startTime: startTimestamp,
                    tas: taDocuments,
                    title: finalTitle,
                    building: locationBuildingSelected || '',
                    room: locationRoomNumSelected || '',
                };
            }

            if (propsSession) {
                const seriesId = propsSession.sessionSeriesId;
                if (seriesId === undefined) {
                    return Promise.reject(
                        new OHMutateError(
                            "This is not a repeating office hour, deselect 'Edit all office hours in this series'."
                        )
                    );
                }
                return updateSeries(firestore, seriesId, series);
            }
            return createSeries(firestore, series);
        }

        const sessionSeriesId = propsSession && propsSession.sessionSeriesId;

        let hybridOrVirtProperties = {}

        if (modality === Modality.HYBRID || modality === Modality.VIRTUAL) {
            hybridOrVirtProperties = {
                useTALink,
                TALink
            }
        }

        const sessionLocation =
            modality === Modality.HYBRID || modality === Modality.INPERSON
                ? {
                    building: locationBuildingSelected || '',
                    room: locationRoomNumSelected || '',
                }
                : {};
        const sessionLink =
            modality === Modality.REVIEW
                ? {
                    link: zoomLink || '',
                }
                : {};
        const sessionWithoutSessionSeriesId = {
            ...hybridOrVirtProperties,
            modality,
            courseId: props.courseId,
            endTime: endTimestamp,
            startTime: startTimestamp,
            tas: taDocuments,
            totalQuestions: 0,
            assignedQuestions: 0,
            resolvedQuestions: 0,
            totalWaitTime: 0,
            totalResolveTime: 0,
            title: finalTitle,
            isPaused: !!(propsSession && propsSession.isPaused),
            ...sessionLocation,
            ...sessionLink,
        };
        const newSession: Omit<FireSession, 'sessionId'> =
            sessionSeriesId === undefined
                ? sessionWithoutSessionSeriesId
                : {
                    ...sessionWithoutSessionSeriesId,
                    ...sessionLocation,
                    ...sessionLink,
                    sessionSeriesId,
                };
        if (propsSession) {
            return updateSession(propsSession, newSession);
        }
        return addSession(newSession);
    }, [
        endTime,
        isSeriesMutation,
        locationBuildingSelected,
        locationRoomNumSelected,
        zoomLink,
        modality,
        props.courseId,
        props.session,
        startTime,
        taSelected,
        title,
        useTALink,
        TALink
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
    const disableProps =
        !(props.session == null) && moment(props.session.endTime).isBefore();

    const emptyNotification = 'Please fill in valid times';
    const stateNotification = 'End time has already passed!';

    const AddTA = (
        <div>
            <div>
                {taSelected.map((ta, i) => {
                    // Filter dropdown by checking if TA has not been selected yet
                    // Include currently selected TA, or else dropdown can't prepopulate if option is missing
                    const dropdownOptions = props.taOptions.filter(
                        (ta) =>
                            ta.value === taSelected[i].id ||
                            !taSelected.some((s) => s.id === ta.value)
                    );

                    return (
                        <div
                            className={
                                'AddTA ' + (i === 0 ? 'First' : 'Additional')
                            }
                            key={ta.id || i}
                        >
                            <Icon name='user' />
                            <Dropdown
                                className='dropdown'
                                placeholder='TA Name'
                                selection={true}
                                options={dropdownOptions}
                                value={ta.id === null ? undefined : ta.id}
                                onChange={(event, data) =>
                                    handleTaList(event, data, i)
                                }
                            />
                            <button
                                type='button'
                                className='AddTAButton'
                                onClick={() => decAddTA(i)}
                            >
                                <Icon name='x' />
                            </button>
                        </div>
                    );
                })}
            </div>
            <button
                type='button'
                className={'AddTAButton ' + isMaxTA}
                disabled={isMaxTA}
                onClick={() => incAddTA()}
            >
                <Icon name='plus' />
                Add another TA
            </button>
        </div>
    );

    return (
        <>
            <div className='ProfessorOHInfo'>
                <div className='row'>
                    {props.isOfficeHour ? 'Modality' : 'Discussion'}
                    <Button.Group className='ModalitySelector'>
                        {props.isOfficeHour && (
                            <div>
                                <Button
                                    active={modality === Modality.VIRTUAL}
                                    onClick={() =>
                                        setModality(Modality.VIRTUAL)
                                    }
                                >
                                    Virtual
                                </Button>
                                <Button
                                    active={modality === Modality.HYBRID}
                                    onClick={() =>
                                        setModality(Modality.HYBRID)
                                    }
                                >
                                    Hybrid
                                </Button>
                                <Button
                                    active={modality === Modality.INPERSON}
                                    onClick={() =>
                                        setModality(Modality.INPERSON)
                                    }
                                >
                                    In Person
                                </Button>
                            </div>
                        )}
                        {!props.isOfficeHour && (
                            <Button
                                active={modality === Modality.REVIEW}
                                onClick={() => setModality(Modality.REVIEW)}
                            >
                                Review
                            </Button>
                        )}
                    </Button.Group>
                </div>
                <div className='row'>
                    <p className='description'>
                        {modality === Modality.VIRTUAL
                            ? 'In a virtual session each TA can provide their own "Virtual Location" ' +
                              '(e.g. Zoom Link, Google Meet Link)' +
                              ' which is provided to the student when the TA is assigned to them.'
                            : modality === Modality.HYBRID
                                ? 'In a hybrid session the student can either provide a Zoom link' +
                              ' or a physical location. Or, if you check the course zoom link checkbox' +
                              ' the student is referred to the course website for the zoom link.'
                                : modality === Modality.REVIEW
                                    ? 'In a review session a Zoom link for the review is posted ' +
                              ' and students can ask questions to be answered during the session.'
                                    : 'In an in-person session the student can provide their physical' +
                              ' location (e.g. by the whiteboard).'}
                    </p>
                </div>
                <div className='row'>
                    <input
                        className='long'
                        placeholder='Enter name of office hour'
                        value={title || ''}
                        onChange={(e) => handleTextField(e, setTitle)}
                    />
                </div>
                {modality === Modality.HYBRID ||
                modality === Modality.INPERSON ? (
                        <div className='row'>
                            <Icon name='marker' />
                            <input
                                className='long'
                                placeholder={`Building/Location${
                                    modality === Modality.HYBRID
                                        ? ' (optional)'
                                        : ''
                                }`}
                                value={locationBuildingSelected || ''}
                                onChange={(e) =>
                                    handleTextField(e, setLocationBuildingSelected)
                                }
                            />
                            <input
                                className='shift'
                                placeholder='Room Number'
                                value={locationRoomNumSelected || ''}
                                onChange={(e) =>
                                    handleTextField(e, setLocationRoomNumSelected)
                                }
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                {modality === Modality.REVIEW ? (
                    <div className='row'>
                        <Icon name='desktop' />
                        <input
                            className='long'
                            placeholder='Zoom link'
                            value={zoomLink || ''}
                            onChange={(e) => handleTextField(e, setZoomLink)}
                        />
                    </div>
                ) : (
                    <></>
                )}
                <div className='Time'>
                    <Icon name='time' />
                    <div className='datePicker'>
                        <DatePicker
                            selected={startTime}
                            onChange={handleStartTime}
                            dateFormat='dddd MM/DD/YY'
                            minDate={moment()}
                            placeholderText={moment().format('dddd MM/DD/YY')}
                            readOnly={true}
                        />
                    </div>
                    <div className='datePicker timePicker shift'>
                        <DatePicker
                            selected={startTime}
                            onChange={handleStartTime}
                            showTimeSelect={true}
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly={true}
                            timeIntervals={10}
                            dateFormat='LT'
                            placeholderText='12:00 PM'
                            readOnly={true}
                        />
                    </div>
                    <span className='shift'>To</span>
                    <div className='datePicker timePicker shift'>
                        <DatePicker
                            selected={endTime}
                            onChange={handleEndTime}
                            showTimeSelect={true}
                            // Manually added showTimeSelectOnly property to react-datepicker/index.d.ts
                            // Will not compile if removed
                            showTimeSelectOnly={true}
                            timeIntervals={10}
                            dateFormat='LT'
                            minTime={startTime || moment().startOf('day')}
                            maxTime={moment().endOf('day')}
                            placeholderText='2:00 PM'
                            readOnly={true}
                        />
                    </div>
                </div>
                <div className="row">
                    {(props.isNewOH ||
                        props.session?.sessionSeriesId != null) && (
                        <Checkbox
                            className='datePicker shift'
                            label={
                                props.isNewOH
                                    ? 'Repeat weekly'
                                    : 'Edit all office hours in this series'
                            }
                            checked={isSeriesMutation}
                            onChange={() => setIsSeriesMutation((old) => !old)}
                        />
                    )}
                    {(modality === Modality.HYBRID || modality === Modality.VIRTUAL) && 
                    (<><Checkbox
                        className="TAZoomCheckbox" 
                        label="Use course zoom link"
                        checked={useTALink}
                        onChange={() => setUseTALink((oldTALink) => {
                            return !oldTALink;
                        })}
                    />
                    {useTALink && (<input
                        className='shift'
                        placeholder='Zoom Link'
                        value={TALink}
                        onChange={(e) =>setTALink(e.target.value)}
                    />)}
                    </>)
                    }
                </div>
                <div className='row TA'>{AddTA}</div>
            </div>
            <div className='EditButtons'>
                <button
                    type='button'
                    className='Bottom Edit'
                    onClick={() => {
                        if (disableEmpty) {
                            updateNotification(emptyNotification);
                        } else if (disableState) {
                            updateNotification(stateNotification);
                        } else {
                            mutateSessionOrSeries()
                                .then(() => {
                                    // eslint-disable-next-line no-console
                                    console.log('Success!');

                                    if (props.isNewOH) {
                                        clearFields();
                                    }

                                    props.toggleEdit();
                                })
                                .catch((err: Error) => {
                                    // TODO(ewlsh): Implement better dialogs and error recovery.
                                    if (err instanceof OHMutateError) {
                                        // eslint-disable-next-line no-alert
                                        alert(err.message);
                                    } else {
                                        // eslint-disable-next-line no-alert
                                        alert(
                                            "We're unable to save your changes at this time, " +
                                                'if you reach out to us at queuemein@cornelldti.org ' +
                                                "we'll be happy to assist you further."
                                        );
                                    }

                                    // eslint-disable-next-line no-console
                                    console.error(err);
                                });
                        }
                    }}
                    disabled={disableProps}
                >
                    {props.isNewOH ? 'Create' : 'Save Changes'}
                </button>
                <button
                    type='button'
                    className='Bottom Cancel'
                    onClick={() => props.toggleEdit()}
                >
                    Cancel
                </button>
                <span className='EditNotification'>{notification}</span>
            </div>
        </>
    );
};

ProfessorOHInfo.defaultProps = {
    session: undefined,
};

export default ProfessorOHInfo;
