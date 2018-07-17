import * as React from 'react';
import * as moment from 'moment';
import DatePicker from 'react-datepicker';
import * as NumericInput from 'react-numeric-input';
import 'react-datepicker/dist/react-datepicker.css';

class ProfoessorTagInfo extends React.Component {

    props: {
        assignmentName?: string
        startTimeDefault?: (moment.Moment | null)
        endTimeDefault?: (moment.Moment | null)
        numQuestions?: number
    };

    state: {
        startTime?: (moment.Moment | null)
        endTime?: (moment.Moment | null)
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            startTime: this.props.startTimeDefault,
            endTime: this.props.endTimeDefault
        };
        this.handleStartTime = this.handleStartTime.bind(this);
        this.handleEndTime = this.handleEndTime.bind(this);
    }

    handleStartTime(startTime: moment.Moment) {
        this.setState({
            startTime: startTime
        });
    }

    handleEndTime(endTime: moment.Moment) {
        this.setState({
            endTime: endTime
        });
    }

    render() {
        var today = moment().format('dddd MM/DD/YY');
        var defaultNumQuestions: number = (this.props.numQuestions === undefined) ? 1 : this.props.numQuestions;

        return (
            <div className="ProfessorTagInfo">
                <div className="Assignment">
                    Assignment Name
                    <div className="AssignmentInput">
                        <input placeholder="Recursion Lab" value={this.props.assignmentName} />
                    </div>
                </div>
                <div className="Time">
                    <div className="datePicker">
                        Date Assigned
                        <DatePicker
                            selected={this.state.startTime}
                            onChange={this.handleStartTime}
                            dateFormat="dddd MM/DD/YY"
                            placeholderText={today}
                        />
                    </div >
                    <span className="to">
                        To
                    </span>
                    <div className="datePicker">
                        Date Due
                        <DatePicker
                            selected={this.state.endTime}
                            onChange={this.handleEndTime}
                            dateFormat="dddd MM/DD/YY"
                            placeholderText={today}
                        />
                    </div >
                </div>
                <div className="NumQuestions">
                    Number of Questions
                    <div className="NumericInput">
                        <NumericInput min={0} max={99} value={defaultNumQuestions} snap={true} strict={true} />
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfoessorTagInfo;
