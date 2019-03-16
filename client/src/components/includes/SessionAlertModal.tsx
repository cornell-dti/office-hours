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
        cancelAction?: Function,
        mainAction?: Function,
        displayModal: boolean,
        displayShade: boolean
    };

    state: {
        displayModal: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            displayModal: this.props.displayModal
        };
    }

    defaultCancel = () => {
        this.setState({
            displayModal: false
        });
    }

    render() {

        // Check if cancelAction is supplied
        let cancel = this.props.cancelAction !== undefined ? this.props.cancelAction : this.defaultCancel;

        // Check if cancelMain is supplied
        let main = this.props.mainAction !== undefined ? this.props.mainAction : cancel;

        var buttons = this.props.buttons.map((button, i: number, arr) =>
            (
                <button
                    key={i}
                    className={arr.length - 1 === i ? 'last' : ''}
                    onClick={() => arr.length - 1 === i ? main() : cancel()}
                >
                    {button}
                </button>
            ));

        let shadeDisplay = this.props.displayShade ? 'shade' : '';

        return (
            this.state.displayModal && (
                <div className="SessionAlertModal">
                    <div
                        className={'modalShadeAlert ' + shadeDisplay}
                        onClick={() => cancel()}
                    />
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
                </div>)
        );
    }
}

export default SessionAlertModal;
