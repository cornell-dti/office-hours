import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class SessionAlertModal extends React.Component {

    props: {
        color: string,
        description: string,
        buttons: string[],
        cancelAction: Function,
        mainAction: Function,
        displayModalShade: boolean,
        action?: Function
    };

    state: {
        isVisible: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            isVisible: true
        };
        this.updateVisible = this.updateVisible.bind(this);
    }

    updateVisible(toggle: boolean) {
        this.setState({
            isVisible: toggle
        });
    }

    render() {
        var buttons = this.props.buttons.map((button, i: number, arr) =>
            (
                <button
                    key={i}
                    className={arr.length - 1 === i ? 'last' : ''}
                    onClick={arr.length - 1 === i ? () => this.props.cancelAction() : () => this.props.mainAction()}
                >
                    {button}
                </button>
            ));

        return (this.state.isVisible && (
            <div className="SessionAlertModal">
                {/* {this.props.displayModalShade &&
                <div className="modalShadeAlert" onClick={() => this.updateVisible(false)} />} */}
                <div className="modalContent">
                    <div className={'text ' + this.props.color}>
                        <div className="Icon">
                            <Icon name="exclamation" />
                        </div>
                        {this.props.description}
                    </div>
                    <div className="buttons">
                        {buttons}
                    </div>
                </div>
            </div>
        ));
    }
}

export default SessionAlertModal;
