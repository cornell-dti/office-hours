import * as React from 'react';
import './SessionPopularQuestion.css';
const peopleLogoImage = require('./peopleLogo.jpg');

class SessionPopularQuestion extends React.Component {
    render() {
        return(
            <div className="SessionPopularQuestion">
                <div className="SessionPopularQuestion-Text">
                    How do you implement recursion on question 4?
                </div>
                <div className="SessionPopularQuestion-People">
                    <img src={peopleLogoImage} className="SessionPopularQuestion-PeopleLogo" alt="3 people logo"/> 2
                </div>
            </div>
        );
    }
}

export default SessionPopularQuestion;