import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';

class SessionAlertModal extends React.Component {

    props: {
        header?: string,
        icon?: SemanticICONS,
        color: string,
        description: string,
        buttons: string[],
        cancelAction: Function,
        mainAction: Function,
        action?: Function
    };

    render() {
        var buttons = this.props.buttons.map((button, i: number, arr) =>
            (
                <button
                    key={i}
                    className={arr.length - 1 === i ? 'last' : ''}
                    onClick={arr.length - 1 === i ? () => this.props.mainAction() : () => this.props.cancelAction()}
                >
                    {button}
                </button>
            ));

        return (
            <div className="SessionAlertModal">
                <div className="modalShadeAlert" onClick={() => this.props.cancelAction()} />
                <div className="modalContent">
                    <div className={'text ' + this.props.color}>
                        {this.props.header && <div className="title">{this.props.header}</div>}
                        {this.props.icon &&
                            <div className="Icon">
                                <Icon name={this.props.icon} />
                            </div>}
                        {this.props.description}
                    </div>
                    <div className="buttons">
                        {buttons}
                    </div>
                </div>
            </div>
        );
    }
}

export default SessionAlertModal;
