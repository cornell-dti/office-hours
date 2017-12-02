import * as React from 'react';
import '../../styles/QuestionHeader.css';

class QuestionHeader extends React.Component {

    render() {
        return (
          <div className="QuestionHeader">
            Add Your Question
            <div className="header">
              <div className="CourseInfo">
                  <span className="CourseNum">CS 3110</span>
                  Michael Clarkson
              </div>
            </div>
            <div className="tagsContainer">
              <div className="tagsMiniContainer">
                <p>Primary Tags</p>
                <div className="Tags">
                    <p>Assignment 1</p>
                    <p>Assignment 2</p>
                    <p>Prelim 1 Feedback</p>
                </div>
                <p>Secondary Tags</p>
                <div className="Tags">
                    <p>Q1</p>
                    <p>Q2</p>
                    <p>Q3</p>
                    <p>Q4</p>
                    <p>Q5</p>
                    <p>Conceptual</p>
                    <p>Clarification</p>
                    <p>Recursion</p>
                    <p>Conditional</p>
                    <p>Data</p>
                    <p>Debugging</p>
                </div>
              </div>
              <div className="tagsMiniContainer">
                <p>Question</p>
              </div>
            </div>
          </div>
        );
    }
}

export default QuestionHeader;
