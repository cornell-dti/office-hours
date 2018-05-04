import * as React from 'react';

import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';

import SelectedTags from '../includes/SelectedTags';

class AddQuestion extends React.Component {

    props: {
        taName: string,
        taPicture: string,
        primaryTags: string[],
        secondaryTags: string[],
        primaryTagsIds: number[],
        secondaryTagsIds: number[],
        secondaryTagParentIds: number[],
        // topicTags: string[]
        sessionId: number,
        courseId: number,
    };

    state: {
        question: string,
        primaryBooleanList: boolean[],
        secondaryBooleanList: boolean[],
        // topicBooleanList: boolean[],
        showSecondaryTags: boolean,
        // showTopicTags: boolean,
        showQuestionInput: boolean,
        doneSelectingTags: boolean,
        numberSecondaryTags: number,
        // numberTopicTags: number,
        redirect: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            question: '',
            primaryBooleanList: new Array(this.props.primaryTags.length).fill(false),
            secondaryBooleanList: new Array(this.props.secondaryTags.length).fill(false),
            // topicBooleanList: new Array(this.props.topicTags.length).fill(false),
            showSecondaryTags: false,
            // showTopicTags: false,
            showQuestionInput: false,
            doneSelectingTags: false,
            numberSecondaryTags: 0,
            // numberTopicTags: 0,
            redirect: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.handlePrimarySelected = this.handlePrimarySelected.bind(this);
        this.handleSecondarySelected = this.handleSecondarySelected.bind(this);
        /*this.handleTopicSelected = this.handleTopicSelected.bind(this);*/
        this.handleEditTags = this.handleEditTags.bind(this);
        this.handleXClick = this.handleXClick.bind(this);
        this.handleJoinClick = this.handleJoinClick.bind(this);
    }

    public handleXClick(event: React.MouseEvent<HTMLElement>): void {
        this.setState({ redirect: true });
    }

    public handleJoinClick(event: React.MouseEvent<HTMLElement>): void {
        this.setState({ redirect: true });
    }

    public handleClick(event: React.ChangeEvent<HTMLTextAreaElement>): void {
        const target = event.target as HTMLTextAreaElement;
        if (target.value.length <= 100) {
            this.setState({ question: target.value });
        }
        if (target.value.length > 0) {
            this.setState({ doneSelectingTags: true });
        } else {
            this.setState({ doneSelectingTags: false });
        }
    }

    public handlePrimarySelected(index: number): void {
        var temp = this.state.primaryBooleanList;
        if (!temp[index]) {
            temp = new Array(this.props.primaryTags.length).fill(false);
            temp[index] = true;
            this.setState({ showSecondaryTags: true });
            /*if (this.state.numberSecondaryTags > 0) {
                this.setState({ showTopicTags: true});
            }
            else {
                this.setState({ showTopicTags: false});
            }*/
        } else {
            temp[index] = false;
            this.setState({ showSecondaryTags: false });
            /*this.setState({ showTopicTags: false });*/
        }
        var cleanSecondaryBool = new Array(this.props.secondaryTags.length).fill(false);
        this.setState({ primaryBooleanList: temp, secondaryBooleanList: cleanSecondaryBool });
    }

    public handleSecondarySelected(index: number): void {
        var temp = this.state.secondaryBooleanList;
        temp[index] = !temp[index];
        if (temp[index]) {
            this.state.numberSecondaryTags++;
        } else {
            this.state.numberSecondaryTags--;
        }
        this.setState({ secondaryBooleanList: temp });
        if (this.state.numberSecondaryTags > 0) {
            /*this.setState({ showTopicTags: true});
            }
            else {
                this.setState({ showTopicTags: false});
            }*/
            this.setState({ showQuestionInput: true });
        } else {
            this.setState({ showQuestionInput: false });
        }
    }

    /*public handleTopicSelected(index: number) : void {
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
    }*/

    public handleEditTags(event: React.MouseEvent<HTMLElement>): void {
        this.setState({ doneSelectingTags: false });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to={'/course/' + this.props.courseId + '/session/' + this.props.sessionId} />;
        }

        var primaryTagsList = this.props.primaryTags.map(
            (tag, index) => {
                return (
                    <SelectedTags
                        key={index}
                        index={index}
                        tag={tag}
                        level={1}
                        ifSelected={this.state.primaryBooleanList[index]}
                        onClick={this.handlePrimarySelected}
                    />
                );
            }
        );

        var selectedPrimaryId = -1;
        var selectedPrimaryIndex = this.state.primaryBooleanList.indexOf(true);
        if (selectedPrimaryIndex !== -1) {
            selectedPrimaryId = this.props.primaryTagsIds[selectedPrimaryIndex];
        }

        var secondaryTagsList = this.props.secondaryTags.map(
            (tag, index) => {
                if (this.props.secondaryTagParentIds[index] === selectedPrimaryId) {
                    return (
                        <SelectedTags
                            key={index}
                            index={index}
                            tag={tag}
                            level={2}
                            ifSelected={this.state.secondaryBooleanList[index]}
                            onClick={this.handleSecondarySelected}
                        />
                    );
                } else {
                    return null;
                }
            }
        );

        /*var topicTagsList = this.props.topicTags.map(
        (tag, index) => {
            return (
                <SelectedTags
                    index={index}
                    tag={tag}
                    ifSelected={this.state.topicBooleanList[index]}
                    onClick={this.handleTopicSelected}
                />
            );
        }
        );*/

        var collapsedPrimary = primaryTagsList.filter(
            (tag) => {
                return tag.props.ifSelected;
            }
        );

        var collapsedSecondary = secondaryTagsList.filter(
            (tag) => {
                if (tag) {
                    return tag.props.ifSelected;
                } else {
                    return false;
                }
            }
        );

        /*var collapsedTopic = this.state.topicBooleanList.map(
            (tag, index) => {
                if (tag) return <p className="selectedTag">{this.props.topicTags[index]}</p>
            else return null
            }
        );*/

        return (
            <div className="AddQuestion">
                <div className="queueHeader">
                    <span className="xbutton" onClick={this.handleXClick}><Icon name="close" /></span>
                    <span className="title">Join The Queue</span>
                </div>
                {/* No longer in design - commending out in case it comes back.
                <hr />
                <div className="taHeader">
                    <div className="QuestionTaInfo">
                        <img src={this.props.taPicture} />
                        <p className="taName">{this.props.taName}</p>
                    </div>
                </div> */}
                <div className="tagsContainer">
                    <hr />
                    <div className="tagsMiniContainer" onClick={this.handleEditTags}>
                        <p className="header">Categories</p>
                        {this.state.doneSelectingTags ?
                            <div className="QuestionTags">
                                {collapsedPrimary}
                            </div> :
                            <div className="QuestionTags">
                                {primaryTagsList}
                            </div>}
                    </div>
                    <hr />
                    <div className="tagsMiniContainer" onClick={this.handleEditTags}>
                        <p className="header">Tags</p>
                        {this.state.showSecondaryTags ?
                            this.state.doneSelectingTags ?
                                <div className="QuestionTags">
                                    {collapsedSecondary}
                                </div> :
                                <div className="QuestionTags">
                                    {secondaryTagsList}
                                </div> : <p className="placeHolder">Select a category</p>}
                    </div>
                    {/*<div className="tagsMiniContainer" onClick={this.handleEditTags}>
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
              </div>*/}
                    <hr />
                    <div className="tagsMiniContainer">
                        <p className="header">Question</p>
                        {this.state.showQuestionInput ?
                            <textarea
                                className="QuestionInput"
                                value={this.state.question}
                                onChange={this.handleClick}
                                placeholder="What's your question about?"
                            />
                            : <p className="placeHolder text">Finish selecting tags...</p>}
                    </div>
                    {this.state.doneSelectingTags ?
                        <p className="AddButton active" onClick={this.handleJoinClick}> Add My Question </p> :
                        <p className="AddButton"> Add My Question </p>
                    }
                </div>
            </div >
        );
    }
}
export default AddQuestion;
