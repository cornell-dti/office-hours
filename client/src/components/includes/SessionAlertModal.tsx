import * as React from 'react';
import * as moment from 'moment';
import { Icon } from 'semantic-ui-react';
import { SemanticICONS } from 'semantic-ui-react/dist/commonjs/generic';

class SessionAlertModal extends React.Component {

    props: {
        header?: string,
        icon?: SemanticICONS,
        color: string,
        description: string,
        OHSession?: AppSession,
        buttons: string[],
        cancelAction?: Function,
        mainAction?: Function,
        displayShade: boolean
    };

    state: {
        displayModal: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            displayModal: true
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

        // Copied over from ProfessorOHInfoDelete
        var taList = this.props.OHSession ?
            this.props.OHSession.sessionTasBySessionId.nodes.map(ta => ta.userByUserId.computedName) : [];

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
                        {/* Copied over from ProfessorOHInfoDelete */}
                        {this.props.OHSession &&
                            <div className="info">
                                <div className="ta">
                                    {taList.join(', ')}
                                    {taList.length === 0 && '(No TA Assigned)'}
                                </div>
                                <div>
                                    <span>
                                        {moment(this.props.OHSession.startTime).format('h:mm A')}&nbsp;
                                        to {moment(this.props.OHSession.endTime).format('h:mm A')}
                                    </span>
                                    <span>
                                        {this.props.OHSession.building} {this.props.OHSession.room}
                                    </span>
                                </div>
                            </div>}
                        <div className="buttons">
                            {buttons}
                        </div>
                    </div>
                </div>)
        );
    }
}

export default SessionAlertModal;
