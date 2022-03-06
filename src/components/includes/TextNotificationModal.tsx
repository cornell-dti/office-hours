import React, { Dispatch, SetStateAction, useState } from 'react';
import { Icon, Checkbox } from 'semantic-ui-react';
import { updatePhoneNum } from '../../firebasefunctions/phoneNumber';
import smsNotif from '../../media/smsNotif.svg'
import phone from '../../media/phone.svg'

enum Validation {
    NOT_REQUESTED,
    SUCCESS,
    FAILURE,
}

type Props = {
    showTextModal: boolean;
    setShowTextModal: Dispatch<SetStateAction<boolean>>;
    user: FireUser | undefined;
    setShowBanner: Dispatch<SetStateAction<boolean>>;
    setBannerText: Dispatch<SetStateAction<string>>;
};

const TextNotificationModal = ({
    showTextModal,
    setShowTextModal,
    user,
    setShowBanner,
    setBannerText
}: Props) => {
    const [phoneNum, setPhoneNum] = useState(user?.phoneNumber || "");
    const [phoneConsent, setPhoneConsent] = useState(user?.textNotifsEnabled || false);
    const [checkError, setCheckError] = useState(false);
    const [validation, setValidation] = useState(Validation.NOT_REQUESTED);
    const isShown = showTextModal ? 'Visible' : '';

    const closeModal = () => {
        setShowTextModal(false);
    };

    const validatePhone = (phNumber: string) => {
        return phNumber.length === 10 && /[1-9]{1}[0-9]{9}/.test(phNumber);
    }

    

    return (
        <>
            {showTextModal && (
                <div className='textNotifModalScreen'>
                    <div 
                        className={`textNotifModal${isShown} 
                        ${user?.textNotifsEnabled ? "textNotifModalExtended" : ""}`
                        } 
                    >
                        <button
                            type='button'
                            className='closeButton'
                            onClick={closeModal}
                        >
                            <Icon name='x' />
                        </button>
                        <img src={smsNotif} alt="Text Notification Icon" className="textNotifModal__icon" />
                        <div className="textNotifModal__header">
                            <div className="textNotifModal__padding" />
                            <div className="textNotifModal__title">Text Message Notifications</div>
                            <div className="textNotifModal__status">
                              Status: {user?.textNotifsEnabled ? 
                                    <span className="on">ON</span> : 
                                    <span className="off">OFF</span>}
                            </div>
                        </div>
                        <div className="textNotifModal__enableDialogue">
                            <div className="enableDialogue__enableTitle">
                                {user?.textNotifsEnabled ? "Update" : "Enable"} SMS Notifications
                            </div>
                            <div className="enableDialogue__split">
                                <div className="enableDialogue__line" > </div>
                                <div className="enableDialogue__content">
                                    <div className="enableDialogue__consent"  > 
                                        <Checkbox
                                            disabled={user?.textNotifsEnabled}
                                            checked={phoneConsent}
                                            onChange={() => {
                                                setCheckError(false);
                                                setPhoneConsent(!phoneConsent)}}
                                        />
                                        <div className="enableDialogue__consentDialogue">
                                          By checking this box you consent to receiving SMS messages from Queue Me In. 
                                          We do not give your number to third party clients.
                                        </div>
                                    </div>
                                    
                                    {checkError && 
                                      <span className="enableDialogue__Error enableDialogue__checkError">
                                        *Please check the box to enable SMS Notifs
                                      </span>
                                    }
                                    
                                    <div className="enableDialogue__phoneForm" >
                                        <img 
                                            src={phone} 
                                            alt="Phone icon" 
                                            className="enableDialogue__phoneIcon" 
                                        />
                                        <input
                                            disabled={!phoneConsent}
                                            className="enableDialogue__phoneInput"
                                            placeholder='Phone Number (ex. 1231231234)' 
                                            value={phoneNum}
                                            onChange={
                                                (e) =>  {
                                                    setValidation(Validation.NOT_REQUESTED)
                                                    if (e.target.value === "" || /^[0-9\b]+$/.test(e.target.value))
                                                        setPhoneNum(e.target.value)
                                                }
                                            }
                                        /> 
                                        <div className="enableDialogue__required">*</div>
                                    </div>
                                    {validation === Validation.FAILURE && 
                                      <span className="enableDialogue__Error enableDialogue__phoneError">
                                        *Please enter a valid phone number to enable SMS Notifs
                                      </span>
                                    }
                                    <button 
                                        className='textNotifModal__confirm'
                                        type='submit'
                                        onClick={
                                            () => {
                                                if (validatePhone(phoneNum) && phoneConsent) {
                                                    setBannerText(
                                                        `Text message notifications have been \
                                                    ${user?.textNotifsEnabled ? "updated" : "enabled"}!`
                                                    );
                                                    updatePhoneNum(user?.userId, {
                                                        phoneNumber: phoneNum, 
                                                        textNotifsEnabled: true
                                                    })
                                                    setValidation(Validation.SUCCESS)
                                                    setShowTextModal(false);
                                                    setShowBanner(true);
                                                } else if(validatePhone(phoneNum)) {
                                                    setCheckError(true);
                                                } else {
                                                    setPhoneConsent(user?.textNotifsEnabled || false);
                                                    setValidation(Validation.FAILURE);
                                                    setCheckError(true);
                                                }
                                            }
                                        }
                                        style={{ marginTop: '1em' }}
                                    >
                                        {user?.textNotifsEnabled ? "Save Changes" : "Enable SMS Notifs"}
                                    </button>
                                </div>
                            </div>
                            
                        </div>
                        {user?.textNotifsEnabled && <div className="textNotifModal__disableDialogue">
                            <div className="disableDialogue__title">Disable SMS Notifications</div>
                            <div className="disableDialogue__split">
                                <div className="disableDialogue__line" > </div>
                                <div className="disableDialogue__content">
                                    <div className="disableDialogue__warning">
                                      NOTE: Disabling SMS notifs will remove your phone number data. 
                                      To re-enable SMS notifs, you&apos;ll have to re-enter you phone number</div>
                                    <button 
                                        className='disableDialogue__confirm'
                                        type='submit'
                                        onClick={
                                            () => {
                                                updatePhoneNum(
                                                  user?.userId, 
                                                  {phoneNumber: "", textNotifsEnabled: false}
                                                )
                                                setPhoneNum("")
                                                setPhoneConsent(false);
                                                setShowTextModal(false);
                                                setShowBanner(true);
                                                setBannerText(
                                                    "Text message notifications have been disabled."
                                                );
                                            }
                                        }
                                    >
                        Disable SMS Notifs
                                    </button>
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>
            )}
        </>
    );
};

export default TextNotificationModal;
