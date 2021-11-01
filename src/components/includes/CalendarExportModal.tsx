import React, { Dispatch, SetStateAction } from 'react';
import { Icon } from 'semantic-ui-react';
import GoogleIcon from '../../media/google_icon.svg';
import AppleIcon from '../../media/apple_icon.svg';

type Props = {
    showCalendarModal: boolean;
    setShowCalendarModal: Dispatch<SetStateAction<boolean>>;
};

const CalendarExportModal = ({
    showCalendarModal,
    setShowCalendarModal,
}: Props) => {
    const isShown = showCalendarModal ? 'Visible' : '';

    const closeModal = () => {
        setShowCalendarModal(false);
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
                                <div className='ExportText'>
                                    Export to Google Calendar
                                </div>
                            </div>
                            <div className='Line' />
                            <div className='CalendarItem'>
                                <img
                                    src={AppleIcon}
                                    alt='Export to Apple Calendar'
                                />
                                <div className='ExportText'>
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
