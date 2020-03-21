import React, { useState } from 'react';
import moment from 'moment';
import { Icon } from 'semantic-ui-react';
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';

type Props = {
    readonly header?: string;
    readonly icon?: SemanticICONS;
    readonly color: string;
    readonly description: string;
    readonly OHSession?: FireSession;
    readonly buttons: string[];
    readonly cancelAction?: Function;
    readonly mainAction?: Function;
    readonly displayShade: boolean;
};

const SessionAlertModal = (
    { header, icon, color, description, OHSession, buttons, cancelAction, mainAction, displayShade }: Props
) => {
    const [displayModal, setDisplayModal] = useState(false);

    const defaultCancel = () => setDisplayModal(false);

    // Check if cancelAction is supplied
    const cancel = cancelAction !== undefined ? cancelAction : defaultCancel;
    // Check if cancelMain is supplied
    const main = mainAction !== undefined ? mainAction : cancel;

    const buttonsToRender = buttons.map((button, i) => (
        <button
            key={i}
            className={buttons.length - 1 === i ? 'last' : ''}
            onClick={() => buttons.length - 1 === i ? main() : cancel()}
        >
            {button}
        </button>
    ));

    const shadeDisplay = displayShade ? 'shade' : '';

    // Copied over from ProfessorOHInfoDelete
    const taList = OHSession
        ? ['COMPUTE TA NAMES'] // RYAN_TODO: actually compute TA names
        // ? this.props.OHSession.tas.nodes.map(ta => ta.userByUserId.computedName)
        : [];

    return displayModal && (
        <div className="SessionAlertModal">
            <div className={'modalShadeAlert ' + shadeDisplay} onClick={() => cancel()} />
            <div className={'modalContent ' + shadeDisplay}>
                <div className={'text ' + color}>
                    {header && <div className="title">{header}</div>}
                    {icon && (
                        <div className="Icon">
                            <Icon name={icon} />
                        </div>
                    )}
                    {description}
                </div>
                {/* Copied over from ProfessorOHInfoDelete */}
                {OHSession && (
                    <div className="info">
                        <div className="ta">
                            {taList.join(', ')}
                            {taList.length === 0 && '(No TA Assigned)'}
                        </div>
                        <div>
                            <span>
                                {moment(OHSession.startTime).format('h:mm A')}&nbsp;
                                to {moment(OHSession.endTime).format('h:mm A')}
                            </span>
                            <span>
                                {OHSession.building} {OHSession.room}
                            </span>
                        </div>
                    </div>
                )}
                <div className="buttons">{buttonsToRender}</div>
            </div>
        </div>
    );
};

export default SessionAlertModal;
