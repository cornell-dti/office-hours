import * as React from 'react';
import * as moment from 'moment';

class ProfessorTagsDelete extends React.Component {

    props: {
        assignmentName: string
        dateAssigned: number
        dateDue: number
        numQuestions: number
    };

    render() {
        // Convert UNIX timestamps to readable time string
        var timeStart = moment(this.props.dateAssigned).format('MM/DD/YYYY');
        var timeEnd = moment(this.props.dateDue).format('MM/DD/YYYY');

        return (
            <div className="ProfessorTagsDelete">
                <div className="question">
                    Are you sure you want to delete this tag?
                </div>
                <div className="info">
                    <div className="assignmentName">
                        {this.props.assignmentName}
                    </div>
                    <div>
                        <span>
                            Assigned: {timeStart}
                        </span>
                        <span>
                            Due: {timeEnd}
                        </span>
                        <span>
                            Questions: {this.props.numQuestions}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorTagsDelete;
