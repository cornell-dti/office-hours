import * as React from 'react';
import '../../styles/SessionQuestionsComponent.css';

const peopleLogoImage = require('../../media/peopleLogo.jpg');

class SessionQuestionsComponent extends React.Component {
    // constructor(props: any) {
    //     super(props);
    //     this.state = {name: this.props.name };
    // }

    props: {
        handleClick: Function,
        updateDetails: Function,
        studentName: string,
        studentQuestion: string,
        tags: string[],
        group: string[],
        numberOfPeople: number
    };

    constructor(props: {}) {
        super(props);
        this.toggleDetails = this.toggleDetails.bind(this);
    }

    toggleDetails(prev: boolean) {
        this.props.handleClick(prev);
        this.props.updateDetails(this.props.studentName, this.props.studentQuestion, this.props.tags, this.props.group);
    }

    render() {
        var tagsList = this.props.tags.map(
            (tag, index) => {
                return <p key={index}>{tag}</p>;
            }
        );

        return (
            <div className="QueueQuestions" onClick={() => this.toggleDetails(true)}>
                <p className="Name">{this.props.studentName}</p>
                <p className="Question">{this.props.studentQuestion}</p>
                <div className="Tags">
                    {tagsList}
                </div>
                <div className="BottomBar">
                    <img src={peopleLogoImage} className={'peopleLogo'} alt="3 people logo" />
                    <p className="NumberOfPeople">{this.props.numberOfPeople}</p>
                    <button className="Button">Resolve</button>
                </div>
            </div>
        );
    }
}

export default SessionQuestionsComponent;