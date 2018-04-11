import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import ConnectedSessionQuestions from '../includes/ConnectedSessionQuestions';

class TASessionView extends React.Component {

    props: {
        match: {
            params: {
                sessionId: number
            }
        }
    };

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
                    sessionId={this.props.match.params.sessionId}
                    data={{}}
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
                <ConnectedSessionQuestions sessionId={this.props.match.params.sessionId} data={{}} />
            </div>
        );
    }
}

export default TASessionView;
