import * as React from 'react';
import * as moment from 'moment';
import { Checkbox } from 'semantic-ui-react';

class ProfessorOHInfoDelete extends React.Component {

    props: {
        ta: string
        timeStart: Date,
        timeEnd: Date,
        locationBuilding: string,
        locationRoomNum: string
        isSeries: boolean
    };

    render() {
        // Convert UNIX timestamps to readable time string
        var date = moment(this.props.timeStart).format('dddd MM/DD/YY');
        var timeStart = moment(this.props.timeStart).format('h:mm A');
        var timeEnd = moment(this.props.timeEnd).format('h:mm A');

        return (
            <div className="ProfessorOHInfoDelete">
                <div className="question">
                    Are you sure you want to delete this office hour?
                </div>
                <div className="info">
                    <div className="ta">
                        {this.props.ta}
                    </div>
                    <div>
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
                </div>
                <div>
                    <Checkbox label="Delete all Office Hours in this series" disabled={!this.props.isSeries} />
                </div>
            </div>
        );
    }
}

export default ProfessorOHInfoDelete;
