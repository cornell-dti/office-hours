import * as React from 'react';
import SelectedTags from '../includes/SelectedTags';

class AddQuestion extends React.Component {

    props: {
        studentName: string,
        studentPicture: string,
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
        showQuestionInput: boolean,
        doneSelectingTags: boolean,
        numberSecondaryTags: number,
        numberTopicTags: number
    }

    constructor(props: {}) {
      super(props);
      this.state = {
        question: "",
        primaryBooleanList: new Array(this.props.primaryTags.length).fill(false),
        secondaryBooleanList: new Array(this.props.secondaryTags.length).fill(false),
        topicBooleanList: new Array(this.props.topicTags.length).fill(false),
        showSecondaryTags: false,
        showTopicTags: false,
        showQuestionInput: false,
        doneSelectingTags: false,
        numberSecondaryTags: 0,
        numberTopicTags: 0
      }
      this.handleClick = this.handleClick.bind(this);
      this.handlePrimarySelected = this.handlePrimarySelected.bind(this);
      this.handleSecondarySelected = this.handleSecondarySelected.bind(this);
      this.handleTopicSelected = this.handleTopicSelected.bind(this);
    }

    public handleClick(event: any) : void {
      this.setState({ question: event.target.value });
      this.setState({ doneSelectingTags: true})
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
      if (temp[index]) this.state.numberTopicTags++;
      else this.state.numberTopicTags--;
      this.setState({ topicBooleanList: temp});
      if (this.state.numberTopicTags > 0) {
        this.setState({ showQuestionInput: true});
      }
      else {
        this.setState({ showQuestionInput: false});
      }
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

        var collapsedPrimary = this.state.primaryBooleanList.map(
          (tag, index) => {
            if (tag) return <p className="selectedTag">{this.props.primaryTags[index]}</p>
            else return null
          }
        );

        var collapsedSecondary = this.state.secondaryBooleanList.map(
          (tag, index) => {
            if (tag) return <p className="selectedTag">{this.props.secondaryTags[index]}</p>
            else return null
          }
        );

        var collapsedTopic = this.state.topicBooleanList.map(
          (tag, index) => {
            if (tag) return <p className="selectedTag">{this.props.topicTags[index]}</p>
            else return null
          }
        );

        return (
          <div className="AddQuestion">
            <hr/>
            <div className="header">
              <div className="QuestionStudentInfo">
                  <img src={require(`${this.props.studentPicture}`)}/>
                  <p className="studentName">{this.props.studentName}</p>
              </div>
            </div>
            <div className="tagsContainer">
              <div className="tagsMiniContainer primaryContainer">
                <hr/>
                <p>Primary Tags</p>
                { this.state.doneSelectingTags ?
                  <div className="QuestionTags">
                    {collapsedPrimary}
                  </div> :
                  <div className="QuestionTags">
                    {primaryTagsList}
                  </div> }
              </div>
              <div className="tagsMiniContainer">
                <hr/>
                <p>Secondary Tags</p>
                { this.state.showSecondaryTags ?
                  this.state.doneSelectingTags ?
                  <div className="QuestionTags">
                    {collapsedSecondary}
                  </div> :
                  <div className="QuestionTags">
                    {secondaryTagsList}
                  </div> : <p className="placeHolder">Select Primary Tag first</p> }
              </div>
              <div className="tagsMiniContainer">
                <hr/>
                <p>Topic Tags</p>
                { this.state.showTopicTags ?
                  this.state.doneSelectingTags ?
                  <div className="QuestionTags">
                    {collapsedTopic}
                  </div> :
                  <div className="QuestionTags">
                    {topicTagsList}
                  </div> : <p className="placeHolder">Select Secondary Tag first</p> }
              </div>
              <div className="tagsMiniContainer">
                <hr/>
                <p>Question</p>
                { this.state.showQuestionInput ?
                  <textarea className="QuestionInput"
                    value={this.state.question}
                    onChange={this.handleClick}
                    placeholder="Write what you want to ask about ...">
                  </textarea> : <p className="placeHolder">First Finish Selecting Tags ...</p> }
              </div>
            </div>
          </div>
        );
    }
}

export default AddQuestion;
