import * as React from 'react';
import * as moment from 'moment';
import { Icon, Checkbox } from 'semantic-ui-react';

class ProfessorDelete extends React.Component {

    props: {
        isDeleteVisible: boolean,
        updateDeleteVisible: Function,
        ta: string
        timeStart: number,
        timeEnd: number,
        locationBuilding: string,
        locationRoomNum: string
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            isToggled: false
        };
        this.updateDeleteVisible = this.updateDeleteVisible.bind(this);
    }

    updateDeleteVisible(toggle: boolean) {
        this.props.updateDeleteVisible(toggle);
    }

    render() {
        // Convert UNIX timestamps to readable time string
        var date = moment(this.props.timeStart).format('dddd MM/DD/YY');
        var timeStart = moment(this.props.timeStart).format('h:mm A');
        var timeEnd = moment(this.props.timeEnd).format('h:mm A');

        return (
            <div className={'ProfessorDelete ' + this.props.isDeleteVisible}>
                <div className="content">
                    <button className="x" onClick={() => this.updateDeleteVisible(false)}>
                        <Icon name="x" />
                    </button>
                    <div className="question">
                        Are you sure you want to delete this office hour?
                    </div>
                    <div className="info">
                        <div className="ta">
                            {this.props.ta}
                        </div>
                        <span>
                            {date}
                        </span>
                        <span>
                            {timeStart} to {timeEnd}
                        </span>
                        <span>
                            {this.props.locationBuilding} {this.props.locationRoomNum}
                        </span>
                    </div>
                    <div>
                        <Checkbox label="Delete all Office Hours in this series" />
                    </div>
                    <span>
                        <button className="Delete">
                            Delete
                        </button>
                        <button className="Cancel" onClick={() => this.updateDeleteVisible(false)}>
                            Cancel
                        </button>
                    </span>
                </div>
            </div>
        );
    }
}

export default ProfessorDelete;
