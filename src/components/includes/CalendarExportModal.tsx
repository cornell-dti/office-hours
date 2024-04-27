import React, { Dispatch, SetStateAction } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '../../media/google_icon.svg';
import AppleIcon from '../../media/apple_icon.svg';
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
    }

    const exportToAppleCalendar = () => {
        const icsData = createIcs();
        downloadFile(icsData);
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
                            <CloseIcon fontSize="large" sx={{
                                color: "black"
                            }} />
                        </button>
                        <img src={CalIcon} alt='Calendar export icon' />
                        {isDayExport ?
                            <div className='Title'>{getDateString()} Office Hours</div> :
                            <div className='Title'>{currentExportSessions[0].title ?
                                course?.code + ` ` + currentExportSessions[0].title : ``}</div>
                        }
                        <div className='CalendarContainer'>
                            {!isDayExport &&
                                <div className='CalendarItem'>
                                    <img
                                        src={GoogleIcon}
                                        alt='Export to Google Calendar'
                                    />
                                    <a
                                        className='ExportText'
                                        href={getGoogleCalendarLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Export to Google Calendar
                                    </a>
                                </div>
                            }
                            {!isDayExport && <div className='Line' />}
                            <div className='CalendarItem'>
                                <img
                                    src={AppleIcon}
                                    alt='Export to Apple Calendar'
                                />
                                <div
                                    className='ExportText'
                                    onClick={exportToAppleCalendar}
                                >
                                    Export to Apple Calendar
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CalendarExportModal;
