import * as React from 'react';
import '../../styles/CalendarSessions.css';
import CalendarSessionCard from './CalendarSessionCard';
import { Redirect } from 'react-router';

class CalendarSessions extends React.Component {

    props: {
        todayEpoch: number
    };

    state: {
        redirectPath: string
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            redirectPath: ''
        };
    }

    handleOnClick = (path: string) => {
        this.setState({ redirectPath: path });
    }

    render() {
        if (this.state.redirectPath.length > 0) {
            return <Redirect push={true} to={this.state.redirectPath} />;
        }
        return (
            <div className="CalendarSessions">
                <div onClick={() => this.handleOnClick('/session')}>
                    <CalendarSessionCard
                        start={1485360000}
                        end={1485363600}
                        ta="Michael Clarkson"
                        location="Gates G11"
                        resolvedNum={5}
                        aheadNum={23}
                    />
                </div>
                <div onClick={() => this.handleOnClick('/session')}>
                    <CalendarSessionCard
                        start={1485360000}
                        end={1485363600}
                        ta="Not Michael Clarkson"
                        location="Gates G11"
                        resolvedNum={5}
                        aheadNum={23}
                    />
                </div>
                <div onClick={() => this.handleOnClick('/session')}>
                    <CalendarSessionCard
                        start={1485360000}
                        end={1485363600}
                        ta="Who is Michael Clarkson"
                        location="Gates G11"
                        resolvedNum={5}
                        aheadNum={23}
                    />
                </div>
            </div>
        );
    }
}

export default CalendarSessions;