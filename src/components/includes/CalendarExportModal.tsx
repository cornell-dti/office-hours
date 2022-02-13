import React, { Dispatch, SetStateAction } from 'react';
import { Icon } from 'semantic-ui-react';
import GoogleIcon from '../../media/google_icon.svg';
import AppleIcon from '../../media/apple_icon.svg';
// import { createNewEvent } from '../../firebasefunctions/GoogleExport';

type Props = {
    showCalendarModal: boolean;
    setShowCalendarModal: Dispatch<SetStateAction<boolean>>;
    currentExportSession: FireSession;
    course: FireCourse | undefined;
};

const CalendarExportModal = ({
    showCalendarModal,
    setShowCalendarModal,
    currentExportSession,
    course,
}: Props) => {
    const isShown = showCalendarModal ? 'Visible' : '';

    const closeModal = () => {
        setShowCalendarModal(false);
    };

    // const createCsv = () => {
    //     const csvRows = [];
    //     const headers = [
    //         'Subject',
    //         'Start Date',
    //         'Start Time',
    //         'End Date',
    //         'End Time',
    //         'Description',
    //         'Location',
    //     ];
    //     csvRows.push(headers.join(','));
    //     const values = [
    //         'Final Exam',
    //         '11/15/2021',
    //         '10:00 AM',
    //         '05/30/2020',
    //         '1:00 PM',
    //         '50 multiple choice',
    //         '106 Valentine Place',
    //     ];
    //     csvRows.push(values.join(','));
    //     return csvRows.join('\n');
    // };

    const getDateItems = (): {date: string; startTime: string; endTime: string} => {
        const date = currentExportSession.startTime
            .toDate()
            .toISOString()
            .split('T')[0]
            .split('-')
            .join('');

        const startTime = currentExportSession.startTime
            .toDate()
            .toString()
            .substring(16, 22)
            .split(':')
            .join('');

        const endTime = currentExportSession.endTime
            .toDate()
            .toString()
            .substring(16, 22)
            .split(':')
            .join('');
        return {date, startTime, endTime};
    }

    const createIcs = () => {
        const icsRows = [];
        const {date, startTime, endTime} = getDateItems();

        icsRows.push('BEGIN:VCALENDAR');
        icsRows.push('VERSION:2.0');
        icsRows.push('PRODID:-//ZContent.net//Zap Calendar 1.0//EN');
        icsRows.push('CALSCALE:GREGORIAN');
        icsRows.push('BEGIN:VEVENT');
        icsRows.push(`SUMMARY:${course?.code} ${currentExportSession.title}`);
        icsRows.push(`DTSTART:${date}T${startTime}00`);
        icsRows.push(`DTEND:${date}T${endTime}00`);
        icsRows.push(
            `LOCATION:${
                'building' in currentExportSession
                    ? `${currentExportSession.building} ${currentExportSession.room}`
                    : currentExportSession.modality === 'review'
                        ? 'Zoom Discussion'
                        : 'Online'
            }`
        );
        icsRows.push('END:VEVENT');
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
        const title = encodeURIComponent(currentExportSession.title ? currentExportSession.title : 
            `${course?.code} office hour`);
        const {date, startTime, endTime} = getDateItems();
        const dates = encodeURIComponent(`${date}T${startTime}00/${date}T${endTime}00`);
        const ctz = encodeURIComponent('America/New_York');
        const location = encodeURIComponent('building' in currentExportSession ? 
            `${currentExportSession.building} ${currentExportSession.room}` : 'Online');

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
                            <Icon name='x' />
                        </button>
                        <div className='Title'>Choose Calendar</div>
                        <div className='CalendarContainer'>
                            <div className='CalendarItem'>
                                <img
                                    src={GoogleIcon}
                                    alt='Export to Google Calendar'
                                />
                                <a
                                    className='ExportText'
                                    href={getGoogleCalendarLink()}
                                >
                                    Export to Google Calendar
                                </a>
                            </div>
                            <div className='Line' />
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
