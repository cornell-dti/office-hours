import * as React from 'react';
import '../../styles/QuestionHeader.css';
import SelectedTags from '../includes/SelectedTags';

class QuestionHeader extends React.Component {

    props: {
        courseName: string,
        profName: string,
        primaryTags: string[],
        secondaryTags: string[]
    };

    state: {
        question: string,
        primaryBooleanList: boolean[],
        secondaryBooleanList: boolean[]
    }

    constructor(props: {}) {
      super(props);
      this.state = {
        question: "What do you want to ask about?",
        primaryBooleanList: new Array(this.props.primaryTags.length).fill(false),
        secondaryBooleanList: new Array(this.props.secondaryTags.length).fill(false)
      }
      this.handleClick = this.handleClick.bind(this);
      this.handlePrimarySelected = this.handlePrimarySelected.bind(this);
      this.handleSecondarySelected = this.handleSecondarySelected.bind(this);
    }

    public handleClick(event: any) : void {
      this.setState({ question: event.target.value });
    }

    public handlePrimarySelected(index: number) : void {
      var temp = this.state.primaryBooleanList;
      temp[index] = !temp[index];
      this.setState({ primaryBooleanList: temp});
    }

    public handleSecondarySelected(index: number) : void {
      var temp = this.state.secondaryBooleanList;
      temp[index] = !temp[index];
      this.setState({ secondaryBooleanList: temp});
    }

    render() {
        var primaryTagsList = this.props.primaryTags.map(
          (tag, index) => {
            return <SelectedTags index={index} tag={tag} ifSelected={this.state.primaryBooleanList[index]} onClick={this.handlePrimarySelected}/>
          }
        );

        var secondaryTagsList = this.props.secondaryTags.map(
          (tag, index) => {
            return <SelectedTags index={index} tag={tag} ifSelected={this.state.secondaryBooleanList[index]} onClick={this.handleSecondarySelected}/>
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
