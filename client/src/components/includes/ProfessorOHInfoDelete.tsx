import * as React from 'react';
import * as moment from 'moment';
import { Checkbox } from 'semantic-ui-react';

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

    props: {
        session: FireSession,
        toggleDelete: Function,
        toggleEdit: Function,
    };

    state: {
        isChecked: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            isChecked: false
        };
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
        this._onClickDeleteSession = this._onClickDeleteSession.bind(this);
        this._onClickDeleteSeries = this._onClickDeleteSeries.bind(this);
    }

    toggleCheckbox() {
        this.setState({
            isChecked: !this.state.isChecked
        });
    }

    _onClickDeleteSession(event: React.MouseEvent<HTMLElement>, DeleteSession: Function) {
        DeleteSession({
            variables: {
                _sessionId: this.props.session.sessionId
            }
        });
    }

    _onClickDeleteSeries(event: React.MouseEvent<HTMLElement>, DeleteSeries: Function) {
        DeleteSeries({
            variables: {
                _seriesId: this.props.session.sessionSeriesId
            }
        });
    }

    render() {
        // Convert UNIX timestamps to readable time string
        let date = moment(this.props.session.startTime).format('dddd MM/DD/YY');
        let timeStart = moment(this.props.session.startTime).format('h:mm A');
        let timeEnd = moment(this.props.session.endTime).format('h:mm A');

        let disable = moment(this.props.session.startTime).isBefore();
        // RYAN_TODO
        let taList: string[] = [];
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
                    onClick={(e) => {
                        // RYAN_TODO
                        // this._onClickDeleteSession(e, DeleteSession);
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
