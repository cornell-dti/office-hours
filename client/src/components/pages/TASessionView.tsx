import * as React from 'react';
import '../../styles/TASessionView.css';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

class TASessionView extends React.Component {

    state: {
        sortPopularity: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            sortPopularity: false
        };
    }

    setSortPop(pop: boolean) {
        this.setState({
            sortPopularity: pop
        });
    }

    render() {
        const chron = !this.state.sortPopularity;
        return (
            <div className="TASessionView">
                <SessionInformationHeader
                    courseName="CS 3110"
                    taName="Michael Clarkson"
                    queueSize={14}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                />
                <div className="SessionSorter">
                    <div
                        className={'SessionSorterItem left ' + (chron ? 'selected' : '')}
                        onClick={() => this.setSortPop(false)}
                    >
                        Chronological
                    </div>
                    <div
                        className={'SessionSorterItem ' + (!chron ? 'selected' : '')}
                        onClick={() => this.setSortPop(true)}
                    >
                        Popularity
                    </div>
                </div>
                <SessionQuestionsContainer />
            </div>
        );
    }
}

export default TASessionView;