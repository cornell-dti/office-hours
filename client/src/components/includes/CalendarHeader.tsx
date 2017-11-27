import * as React from 'react';
import { Button } from 'semantic-ui-react';
import '../../styles/CalendarHeader.css';

class CalendarHeader extends React.Component {
    props: {
        currentCourse: string
    };

    render() {
        return (
            <div className="CalendarHeader">
                <div className="CurrentCourse">
                    {this.props.currentCourse}
                    <Button className="SelectButton" size="big" compact icon="angle down" />
                </div>
                <Button className="MenuButton" size="big" compact icon="bars" />
            </div>
        );
    }
}

export default CalendarHeader;