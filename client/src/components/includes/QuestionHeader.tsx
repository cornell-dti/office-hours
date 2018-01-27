import * as React from 'react';
import '../../styles/QuestionHeader.css';

class QuestionHeader extends React.Component {

    props: {
        courseName: string,
        profName: string,
        primaryTags: string[],
        secondaryTags: string[]
    };

    state: {
        question: string
    }

    constructor(props: {}) {
      super(props);
      this.state = {
        question: "What do you want to ask about?",
      }
      this.handleClick = this.handleClick.bind(this);
    }

    /*handleClick(item: string) {
        this.setState({
            question: item
        });
        this.props.handleClick(item);
    }*/

    handleClick() {
      this.setState({question: "bob"});
    }

    render() {
        var primaryTagsList = this.props.primaryTags.map(
          (tag, index) => {
            return <p key={index}>{tag}</p>;
          }
        );

        var secondaryTagsList = this.props.secondaryTags.map(
          (tag, index) => {
            return <p key={index}>{tag}</p>;
          }
        );

        return (
          <div className="QuestionHeader">
            Add Your Question
            <div className="header">
              <div className="QuestionCourseInfo">
                  <span className="QuestionCourseNum">{this.props.courseName}</span>
                  {this.props.profName}
              </div>
            </div>
            <div className="tagsContainer">
              <p className="x">x</p>
              <div className="tagsMiniContainer">
                <p>Primary Tags</p>
                <div className="QuestionTags">
                    {primaryTagsList}
                </div>
              </div>
              <div className="tagsMiniContainer">
                <p>Secondary Tags</p>
                <div className="QuestionTags">
                    {secondaryTagsList}
                </div>
              </div>
              <div className="tagsMiniContainer2">
                <p>Question</p>
                <input className="QuestionInput"
                  type="text"
                  value={this.state.question}
                  onChange={this.handleClick}>
                </input>
              </div>
            </div>
          </div>
        );
    }
}

export default QuestionHeader;
