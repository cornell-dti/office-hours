import React from 'react';
import { Icon } from 'semantic-ui-react';
import JoinAlert from '../../media/joinAlert.svg';

type Props = {
    show: boolean;
    closeModal: () => void;
    message: string;
};

const JoinErrorMessage = ({ show, message, closeModal }: Props) => {

    const isShown = show ? "Visible" : "";

    return (
        <div className="JoinErrorMessageScreen">
            <div className={'JoinErrorMessage' + isShown}>
                <button type="button" className="closeButton" onClick={closeModal}><Icon name="x" /> </button>
                <img src={JoinAlert} alt="Notification Bell" />
                <p>{message}</p>
                <button type="button" className="GotItButton" onClick={closeModal}>Got it</button>
            </div>
            
        </div>

    );
};

export default JoinErrorMessage;

