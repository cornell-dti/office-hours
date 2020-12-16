import React, { useState, ReactElement } from 'react';
import moment from 'moment';
import { Icon } from 'semantic-ui-react';
// eslint-disable-next-line import/no-unresolved
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';
import { useSessionTANames } from '../../firehooks';

import AccessibleButton from './AccessibleButton';

type Props = {
    readonly header?: string;
    readonly icon?: SemanticICONS;
    readonly color: string;
    readonly description: string;
    readonly course: FireCourse;
    readonly OHSession?: FireSession;
    readonly buttons: readonly string[];
    readonly cancelAction?: Function;
    readonly mainAction?: Function;
    readonly displayShade: boolean;
};

const SessionAlertModal = (
    { header, icon, color, description, course, OHSession, buttons, cancelAction, mainAction, displayShade }: Props
) => {
    const tas = useSessionTANames(course, OHSession);
    const [displayModal, setDisplayModal] = useState(true);

    const defaultCancel = () => setDisplayModal(false);

    // Check if cancelAction is supplied
    const cancel = cancelAction !== undefined ? cancelAction : defaultCancel;
    // Check if cancelMain is supplied
    const main = mainAction !== undefined ? mainAction : cancel;

    const buttonsToRender = buttons.map((button, i) => (
        <button
            // This is a static array so we can use the array index.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            type="button"
            className={buttons.length - 1 === i ? 'last' : ''}
            onClick={() => buttons.length - 1 === i ? main() : cancel()}
        >
            {button}
        </button>
    ));

    const shadeDisplay = displayShade ? 'shade' : '';

    // Copied over from ProfessorOHInfoDelete
    const taList = OHSession ? tas : [];

    if (!displayModal) {
        return null as unknown as ReactElement;
    }

    return (
        <div className="SessionAlertModal">
            <AccessibleButton className={'modalShadeAlert ' + shadeDisplay} onInteract={() => cancel()} />
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
                            {'building' in OHSession ? <span>
                                {OHSession.building} {OHSession.room}
                            </span> : <span>Online</span>}

                        </div>
                    </div>
                )}
                <div className="buttons">{buttonsToRender}</div>
            </div>
        </div>
    );
};

export default SessionAlertModal;
