import * as React from 'react';
import SelectedTags from '../includes/SelectedTags';

class AddQuestion extends React.Component {

    props: {
        courseName: string,
        profName: string,
        primaryTags: string[],
        secondaryTags: string[],
        topicTags: string[]
    };

    state: {
        question: string,
        primaryBooleanList: boolean[],
        secondaryBooleanList: boolean[],
        topicBooleanList: boolean[],
        showSecondaryTags: boolean,
        showTopicTags: boolean,
        numberSecondaryTags: number
    }

    constructor(props: {}) {
      super(props);
      this.state = {
        question: "What do you want to ask about?",
        primaryBooleanList: new Array(this.props.primaryTags.length).fill(false),
        secondaryBooleanList: new Array(this.props.secondaryTags.length).fill(false),
        topicBooleanList: new Array(this.props.topicTags.length).fill(false),
        showSecondaryTags: false,
        showTopicTags: false,
        numberSecondaryTags: 0
      }
      this.handleClick = this.handleClick.bind(this);
      this.handlePrimarySelected = this.handlePrimarySelected.bind(this);
      this.handleSecondarySelected = this.handleSecondarySelected.bind(this);
      this.handleTopicSelected = this.handleTopicSelected.bind(this);
    }

    public handleClick(event: any) : void {
      this.setState({ question: event.target.value });
    }

    public handlePrimarySelected(index: number) : void {
        var temp = this.state.primaryBooleanList;
        if (!temp[index]) {
          temp = new Array(this.props.primaryTags.length).fill(false);
          temp[index] = !temp[index];
          this.setState({ showSecondaryTags: true});
          if (this.state.numberSecondaryTags > 0) {
            this.setState({ showTopicTags: true});
          }
          else {
            this.setState({ showTopicTags: false});
          }
        }
        else {
          temp[index] = !temp[index];
          this.setState({ showSecondaryTags: false});
          this.setState({ showTopicTags: false });
        }
      this.setState({ primaryBooleanList: temp});
    }

    public handleSecondarySelected(index: number) : void {
      var temp = this.state.secondaryBooleanList;
      temp[index] = !temp[index];
      if (temp[index]) this.state.numberSecondaryTags++;
      else this.state.numberSecondaryTags--;
      this.setState({ secondaryBooleanList: temp});
      if (this.state.numberSecondaryTags > 0) {
        this.setState({ showTopicTags: true});
      }
      else {
        this.setState({ showTopicTags: false});
      }
    }

    public handleTopicSelected(index: number) : void {
      var temp = this.state.topicBooleanList;
      temp[index] = !temp[index];
      this.setState({ topicBooleanList: temp});
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

        var topicTagsList = this.props.topicTags.map(
          (tag, index) => {
            return <SelectedTags index={index} tag={tag} ifSelected={this.state.topicBooleanList[index]} onClick={this.handleTopicSelected}/>
          }
        );

        return (
          <div className="AddQuestion">
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
                { this.state.showSecondaryTags ?
                  <div className="QuestionTags">
                    {secondaryTagsList}
                  </div> : null }
              </div>
              <div className="tagsMiniContainer">
                <p>Topic Tags</p>
                { this.state.showTopicTags ?
                  <div className="QuestionTags">
                    {topicTagsList}
                  </div> : null }
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

export default AddQuestion;
