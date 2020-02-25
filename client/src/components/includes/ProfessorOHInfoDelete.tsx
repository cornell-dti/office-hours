import * as React from 'react';
import moment from 'moment';
import { Checkbox } from 'semantic-ui-react';
import { firestore } from '../../firebase';
import { deleteSeries } from '../../firebasefunctions';

// const DELETE_SESSION = gql`
//     mutation DeleteSession($_sessionId: Int!) {
//         apiDeleteSession(input: {_sessionId: $_sessionId}) {
//             clientMutationId
//         }
//     }
// `;

// const DELETE_SERIES = gql`
//     mutation DeleteSeries($_seriesId: Int!) {
//         apiDeleteSeries(input: {_seriesId: $_seriesId}) {
//             clientMutationId
//         }
//     }
// `;

class ProfessorOHInfoDelete extends React.Component {

    props!: {
        session: FireSession;
        toggleDelete: Function;
        toggleEdit: Function;
    };

    state!: {
        isChecked: boolean;
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            isChecked: false
        };
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
    }

    toggleCheckbox() {
        this.setState({
            isChecked: !this.state.isChecked
        });
    }

    _deleteSessionOrSeries = () => {
        if (this.state.isChecked) {
            const { sessionSeriesId } = this.props.session;
            if (sessionSeriesId !== undefined) {
                deleteSeries(firestore, sessionSeriesId);
            }
        } else {
            firestore.collection('sessions').doc(this.props.session.sessionId).delete();
        }
    };

    render() {
        // Convert UNIX timestamps to readable time string
        const date = moment(this.props.session.startTime.toDate()).format('dddd MM/DD/YY');
        const timeStart = moment(this.props.session.startTime.toDate()).format('h:mm A');
        const timeEnd = moment(this.props.session.endTime.toDate()).format('h:mm A');

        const disable = moment(this.props.session.startTime.toDate()).isBefore();
        // RYAN_TODO
        const taList: string[] = [];
        // this.props.session.sessionTasBySessionId.nodes.map(ta => ta.userByUserId.computedName);

        return (
            <React.Fragment>
                <div className="ProfessorOHInfoDelete">
                    <div className="question">
                        Are you sure you want to delete this office hour?
                    </div>
                    <div className="info">
                        <div className="ta">
                            {taList.join(', ')}
                            {taList.length === 0 && '(No TA Assigned)'}
                        </div>
                        <div>
                            <span>
                                {date}
                            </span>
                            <span>
                                {timeStart} to {timeEnd}
                            </span>
                            <span>
                                {this.props.session.building} {this.props.session.room}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Checkbox
                            label="Delete all office hours in this series"
                            disabled={this.props.session.sessionSeriesId === null}
                            checked={this.state.isChecked}
                            onChange={this.toggleCheckbox}
                        />
                    </div>
                    {disable &&
                        <div className="EndedText">
                            This session has already passed!
                        </div>
                    }
                </div>
                <button
                    className="Delete"
                    onClick={() => {
                        this._deleteSessionOrSeries();
                        this.props.toggleDelete();
                        this.props.toggleEdit();
                    }}
                    disabled={disable}
                >
                    Delete
                </button>
            </React.Fragment>
        );
    }
}

export default ProfessorOHInfoDelete;
