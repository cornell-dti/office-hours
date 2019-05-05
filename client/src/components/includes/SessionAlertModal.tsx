import * as React from 'react';
import { Icon, SemanticICONS } from 'semantic-ui-react';

const SessionAlertModal = (props: {
    header?: string;
    icon?: SemanticICONS;
    color: string;
    description: string;
    buttons: string[];
    cancelAction: Function;
    mainAction: Function;
}) => {
    const buttons = props.buttons.map((button, i: number, arr) => (
        <button
            key={button}
            className={arr.length - 1 === i ? 'last' : ''}
            onClick={arr.length - 1 === i ? () => props.mainAction() : () => props.cancelAction()}
            type="button"
        >
            {button}
        </button>
    ));

    return (
        <div className="SessionAlertModal">
            <div className="modalShadeAlert" onClick={() => props.cancelAction()} />
            <div className="modalContent">
                <div className={`text ${props.color}`}>
                    {props.header && <div className="title">{props.header}</div>}
                    {props.icon
                        && (
                            <div className="Icon">
                                <Icon name={props.icon} />
                            </div>
                        )
                    }
                    {props.description}
                </div>
                <div className="buttons">
                    {buttons}
                </div>
            </div>
        </div>
    );
};

export default SessionAlertModal;
