import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class ProfessorHeader extends React.Component {
    props: {
        professor: string
        image: string
        notification: boolean
    };

    render() {
        return (
            <div className={'ProfessorHeader ' + this.props.notification}>
                <button>
                    <Icon.Group>
                        <Icon name="bell outline" size="big" color="grey" />
                        <Icon className="notification" corner name="circle" color="pink" />
                    </Icon.Group>
                </button>
                <img src={this.props.image} />
                <span className="ProfessorName">
                    {this.props.professor}
                </span>
            </div>
        );
    }
}

export default ProfessorHeader;