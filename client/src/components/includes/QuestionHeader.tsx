import * as React from 'react';
import '../../styles/QuestionHeader.css';

class QuestionHeader extends React.Component {

    render() {
        return (
          <div className="QuestionHeader">
            Add Your Question
            <div className="header">
              <div className="QuestionCourseInfo">
                  <span className="QuestionCourseNum">CS 3110</span>
                  Michael Clarkson
              </div>
            </div>
            <div className="tagsContainer">
              <p className="x">x</p>
              <div className="tagsMiniContainer">
                <p>Primary Tags</p>
                <div className="QuestionTags">
                    <p className="selectedTag">Assignment 1</p>
                    <p>Assignment 2</p>
                    <p>Prelim 1 Feedback</p>
                </div>
              </div>
              <div className="tagsMiniContainer">
                <p>Secondary Tags</p>
                <div className="QuestionTags">
                    <p className="selectedTag">Q1</p>
                    <p>Q2</p>
                    <p>Q3</p>
                    <p>Q4</p>
                    <p>Q5</p>
                    <p>Conceptual</p>
                    <p className="selectedTag">Clarification</p>
                    <p>Recursion</p>
                    <p>Conditional</p>
                    <p>Data</p>
                    <p>Debugging</p>
                </div>
              </div>
              <div className="tagsMiniContainer2">
                <p>Question</p>
                <p className="QuestionInput">What do you want to ask about?</p>
              </div>
            </div>
          </div>
        );
    }
}

export default QuestionHeader;
