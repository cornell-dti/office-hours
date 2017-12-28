import * as React from 'react';
import '../../styles/DetailedQuestionView.css';

class DetailedQuestionView extends React.Component {
    // props: {
    //     StudentName: string,
    //     StudentQuestion: string,
    //     Tags: string[],
    //     Group: string[]
    // };

    render() {
        return (
            <div className="DetailedQuestionView">
                <div className="DetailedQuestionInfo">
                    <div className="StudentInfo">
                        <header>Edgar Stewart</header>
                        <p>How to start assignment 3?</p>
                    </div>
                    <div className="DetailedTags">
                        <p>Assignment 1</p>
                        <p>Q4</p>
                        <p>Recursion</p>
                        <p>Conceptual</p>
                    </div>
                    <div className="GroupInfo">
                        <header>Students In This Group</header>
                        <ul>
                            <li>Josh</li>
                            <li>Bill</li>
                            <li>Pat</li>
                            <li>Harv</li>
                        </ul>
                    </div>
                </div>
                {/* <button className="DetailedResolveButton">Resolve</button> */}
                <button className="DetailedCloseButton">Close</button>
            </div>
        );
    }
}

export default DetailedQuestionView;