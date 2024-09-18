import React, { Dispatch, SetStateAction } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Button, Icon } from 'semantic-ui-react';
import CalIcon from '../../media/cal_icon.svg';


type Props = {
    showCalendarModal: boolean;
    setShowCalendarModal: Dispatch<SetStateAction<boolean>>;
    isDayExport: boolean;
    currentExportSessions: FireSession[];
    course: FireCourse | undefined;
};

const CalendarExportModal = ({
    showCalendarModal,
    setShowCalendarModal,
    isDayExport,
    currentExportSessions,
    course,
}: Props) => {
    const isShown = showCalendarModal ? 'Visible' : '';

    const closeModal = () => {
        setShowCalendarModal(false);
    };

    const getDateItems = (session: FireSession): { date: string; startTime: string; endTime: string } => {
        const date = session.startTime
            .toDate()
            .toISOString()
            .split('T')[0]
            .split('-')
            .join('');

        const startTime = session.startTime
            .toDate()
            .toString()
            .substring(16, 22)
            .split(':')
            .join('');

        const endTime = session.endTime
            .toDate()
            .toString()
            .substring(16, 22)
            .split(':')
            .join('');
        return { date, startTime, endTime };
    }

    const getDateString = (): string => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        const dateStr = (
            `${days[currentExportSessions[0].startTime.toDate().getDay()]}, ` +
            `${months[currentExportSessions[0].startTime.toDate().getMonth()]} ` +
            `${currentExportSessions[0].startTime.toDate().getDate()}`);
        return dateStr;
    }

    /** Returns a string of the time in hours:minutes AM/PM.
     * Ex: Returns 2:20:23 PM-3:20:23 PM as 2:20 PM-3:20 PM */
    const getTimeString = (localeTime: string): string =>
        localeTime.substring(0, localeTime.lastIndexOf(":")) + " " +
        localeTime.substring(localeTime.length - 2)


    const createIcs = () => {
        const icsRows = [];

        icsRows.push('BEGIN:VCALENDAR');
        icsRows.push('VERSION:2.0');
        icsRows.push('PRODID:-//ZContent.net//Zap Calendar 1.0//EN');
        icsRows.push('CALSCALE:GREGORIAN');
        for (const session of currentExportSessions) {
            const { date, startTime, endTime } = getDateItems(session);

            icsRows.push('BEGIN:VEVENT');
            icsRows.push(`SUMMARY:${course?.code} ${session.title ?
                session.title : ` Office Hour`}`);
            icsRows.push(`DTSTART:${date}T${startTime}00`);
            icsRows.push(`DTEND:${date}T${endTime}00`);
            icsRows.push(
                `LOCATION:${'building' in session
                    ? `${session.building} ${session.room}`
                    : session.modality === 'review'
                        ? 'Zoom Discussion'
                        : 'Online'
                }`
            );
            icsRows.push('END:VEVENT');
        }
        icsRows.push('END:VCALENDAR');
        return icsRows.join('\n');
    };

    const downloadFile = (data: string) => {
        const blob = new Blob([data], { type: 'text/calendar;charset=utf8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'calendar.ics');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getGoogleCalendarLink = (): string => {
        const title = encodeURIComponent(`${course?.code} ${currentExportSessions[0].title ?
            currentExportSessions[0].title : ` Office Hour`}`);
        const { date, startTime, endTime } = getDateItems(currentExportSessions[0]);
        const dates = encodeURIComponent(`${date}T${startTime}00/${date}T${endTime}00`);
        const ctz = encodeURIComponent('America/New_York');
        const location = encodeURIComponent('building' in currentExportSessions[0] ?
            `${currentExportSessions[0].building} ${currentExportSessions[0].room}` : 'Online');

        const finalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${title}&dates=${dates}&ctz=${ctz}&location=${location}`;
        return finalLink;
    };

    const exportToAppleCalendar = () => {
        const icsData = createIcs();
        downloadFile(icsData);
    };

    const dayExport = () => { return <div className='Title'>{getDateString()} Office Hours </div> };

    const sessionExport = (session: FireSession) => {
        return (
            <div className='Title'>{session.title &&
                <div>
                    {course?.code + " : " + session.title}
                    <div className='Subtitle'> {getDateString() + " @ " +
                        getTimeString(
                            session.startTime
                                .toDate().toLocaleTimeString())
                        + "-" +
                        getTimeString(session
                            .endTime.toDate().toLocaleTimeString())}
                    </div>
                </div>}
            </div>)
    };

    return (
        <>
            {showCalendarModal && (
                <div className='CalendarExportModalScreen'>
                    <div className={'CalendarExportModal' + isShown}>
                        <button
                            type='button'
                            className='closeButton'
                            onClick={closeModal}
                        >
                            <CloseIcon
                                fontSize="large"
                                sx={{
                                    color: "black"
                                }}
                            />
                        </button>
                        <img src={CalIcon} alt='Calendar export icon' id="calIcon" />
                        {isDayExport ?
                            dayExport() : sessionExport(currentExportSessions[0])
                        }
                        <div className='CalendarContainer'>

                            <Button
                                onClick={() => window.open(getGoogleCalendarLink(), "_blank")}
                                className="export-btn"
                            >
                                <Button.Content icon>
                                    <Icon name='google' />
                                    Add to GCal
                                </Button.Content>
                            </Button>
                        </div>

                        <div className='CalendarContainer' id="last">
                            <Button onClick={exportToAppleCalendar} className="export-btn">
                                <Button.Content icon>
                                    <Icon name='apple' />
                                    Add to iCal
                                </Button.Content>
                            </Button>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CalendarExportModal;
