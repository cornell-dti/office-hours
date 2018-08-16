import * as React from 'react';
import * as moment from 'moment';
import { Checkbox } from 'semantic-ui-react';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const DELETE_SESSION = gql`
    mutation DeleteSession($_sessionId: Int!) {
        apiDeleteSession(input: {_sessionId: $_sessionId}) {
            clientMutationId
        }
    }
`;

const DELETE_SERIES = gql`
    mutation DeleteSeries($_seriesId: Int!) {
        apiDeleteSeries(input: {_seriesId: $_seriesId}) {
            clientMutationId
        }
    }
`;

class ProfessorOHInfoDelete extends React.Component {

    props: {
        ta: string[],
        timeStart: Date,
        timeEnd: Date,
        locationBuilding: string,
        locationRoomNum: string,
        sessionId: number,
        sessionSeriesId: number,
        toggleDelete: Function,
        toggleEdit: Function,
        refreshCallback: Function
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
                _sessionId: this.props.sessionId
            }
        });
    }

    _onClickDeleteSeries(event: React.MouseEvent<HTMLElement>, DeleteSeries: Function) {
        DeleteSeries({
            variables: {
                _seriesId: this.props.sessionSeriesId
            }
        });
    }

    render() {
        // Convert UNIX timestamps to readable time string
        var date = moment(this.props.timeStart).format('dddd MM/DD/YY');
        var timeStart = moment(this.props.timeStart).format('h:mm A');
        var timeEnd = moment(this.props.timeEnd).format('h:mm A');

        var disable = moment(this.props.timeStart).isBefore();

        return (
            <React.Fragment>
                <div className="ProfessorOHInfoDelete">
                    <div className="question">
                        Are you sure you want to delete this office hour?
                </div>
                    <div className="info">
                        <div className="ta">
                            {this.props.ta !== undefined && this.props.ta.join(', ')}
                            {this.props.ta !== undefined && this.props.ta.length === 0 && '(No TA Assigned)'}
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
                        <Checkbox
                            label="Delete all office hours in this series"
                            disabled={this.props.sessionSeriesId === null}
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
                {this.state.isChecked ?
                    <Mutation mutation={DELETE_SERIES} onCompleted={() => this.props.refreshCallback()}>
                        {(DeleteSeries) =>
                            <button
                                className="Delete"
                                onClick={(e) => {
                                    this._onClickDeleteSeries(e, DeleteSeries);
                                    this.props.toggleDelete();
                                    this.props.toggleEdit();
                                }}
                                disabled={disable}
                            >
                                Delete
                            </button>
                        }
                    </Mutation> :
                    <Mutation mutation={DELETE_SESSION} onCompleted={() => this.props.refreshCallback()}>
                        {(DeleteSession) =>
                            <button
                                className="Delete"
                                onClick={(e) => {
                                    this._onClickDeleteSession(e, DeleteSession);
                                    this.props.toggleDelete();
                                    this.props.toggleEdit();
                                }}
                                disabled={disable}
                            >
                                Delete
                            </button>
                        }
                    </Mutation>
                }
            </React.Fragment>
        );
    }
}

export default ProfessorOHInfoDelete;
