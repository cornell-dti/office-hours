import * as React from 'react';
import '../../styles/SessionQuestionsComponent.css';

const peopleLogoImage = require('../../media/peopleLogo.jpg');

class SessionQuestionsComponent extends React.Component {
    // constructor(props: any) {
    //     super(props);
    //     this.state = {name: this.props.name };
    // }

    render() {
        return (
            <div className="QueueQuestions">
                <p className="Name">Karun Singh</p>
                <p className="Question">How do implement recursion on question 4?</p>
                <div className="Tags">
                    <p>Assignment 1</p>
                    <p>Q4</p>
                    <p>Recursion</p>
                    <p>Conceptual</p>
                </div>
                <div className="BottomBar">
                    <img src={peopleLogoImage} className={'peopleLogo'} alt="3 people logo" />
                    <p className="NumberOfPeople">2</p>
                    <button className="Button">Resolve</button>
                </div>
            </div>
        );
    }
}

export default SessionQuestionsComponent;