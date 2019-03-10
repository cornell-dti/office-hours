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
        mainAction?: Function,
        displayModal: boolean
    };

    render() {
        let main = () => (this.props.mainAction !== undefined ?
            this.props.mainAction() : this.props.cancelAction());

        var buttons = this.props.buttons.map((button, i: number, arr) =>
            (
                <button
                    key={i}
                    className={arr.length - 1 === i ? 'last' : ''}
                    onClick={arr.length - 1 === i ? main : () => this.props.cancelAction()}
                >
                    {button}
                </button>
            ));

        let shadeDisplay = this.props.displayModal ? 'shade' : '';

        return (
            <div className="SessionAlertModal">

                <div className={'modalContent ' + shadeDisplay}>
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
                <div
                    className={'modalShadeAlert ' + shadeDisplay}
                    onClick={() => this.props.cancelAction()}
                />
            </div>
        );
    }
}

export default SessionAlertModal;
