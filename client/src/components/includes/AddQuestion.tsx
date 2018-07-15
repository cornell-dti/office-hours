import * as React from 'react';

import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import SelectedTags from '../includes/SelectedTags';

const ADD_QUESTION = gql`
mutation AddQuestion($content: String!, $tags: [Int], $sessionId: Int!) {
    apiAddQuestion(input: {_content: $content, _tags: $tags, _status: "unresolved",
        _sessionId: $sessionId}) {
        clientMutationId
    }
}
`;

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
    }

    public handleXClick = (event: React.MouseEvent<HTMLElement>): void => {
        this.setState({ redirect: true });
    }

    public handleJoinClick = (event: React.MouseEvent<HTMLElement>, addQuestion: Function): void => {
        var selectedTagIds: number[] = [];
        for (var i = 0; i < this.state.primaryBooleanList.length; i++) {
            if (this.state.primaryBooleanList[i]) {
                selectedTagIds.push(this.props.primaryTagsIds[i]);
            }
        }
        for (i = 0; i < this.state.secondaryBooleanList.length; i++) {
            if (this.state.secondaryBooleanList[i]) {
                selectedTagIds.push(this.props.secondaryTagsIds[i]);
            }
        }
        addQuestion({
            variables: {
                content: this.state.question,
                tags: selectedTagIds,
                sessionId: this.props.sessionId
            }
        });
        this.setState({ redirect: true });
    }

    public handleClick = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        if (target.value.length <= 100) {
            this.setState({ question: target.value });
        }
        this.setState({ doneSelectingTags: target.value.length > 0 });
    }

    public handlePrimarySelected = (index: number): void => {
        var temp = this.state.primaryBooleanList;
        if (!temp[index]) {
            temp = new Array(this.props.primaryTags.length).fill(false);
            temp[index] = true;
            this.setState({ showSecondaryTags: true });
        } else {
            temp[index] = false;
            this.setState({ showSecondaryTags: false });
        }
        var cleanSecondaryBool = new Array(this.props.secondaryTags.length).fill(false);
        this.setState({ primaryBooleanList: temp, secondaryBooleanList: cleanSecondaryBool });
    }

    public handleSecondarySelected = (index: number): void => {
        var temp = this.state.secondaryBooleanList;
        temp[index] = !temp[index];
        if (temp[index]) {
            this.state.numberSecondaryTags++;
        } else {
            this.state.numberSecondaryTags--;
        }
        this.setState({
            secondaryBooleanList: temp,
            showQuestionInput: this.state.numberSecondaryTags > 0
        });
    }

    public handleEditTags = (event: React.MouseEvent<HTMLElement>): void => {
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
                        isSelected={this.state.primaryBooleanList[index]}
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
                            isSelected={this.state.secondaryBooleanList[index]}
                            onClick={this.handleSecondarySelected}
                        />
                    );
                }
                return null;
            }
        );

        var collapsedPrimary = primaryTagsList.filter(
            (tag) => tag.props.isSelected
        );

        var collapsedSecondary = secondaryTagsList.filter(
            (tag) => tag ? tag.props.isSelected : false
        );

        return (
            <div className="QuestionView">
                <div className="AddQuestion">
                    <div className="queueHeader">
                        <p className="xbutton" onClick={this.handleXClick}><Icon name="close" /></p>
                        <p className="title">Join The Queue</p>
                    </div>
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
                        <Mutation mutation={ADD_QUESTION}>
                            {(addQuestion) =>
                                this.state.doneSelectingTags ?
                                    <p
                                        className="AddButton active"
                                        onClick={(e) => this.handleJoinClick(e, addQuestion)}
                                    >
                                        Add My Question
                                    </p>
                                    :
                                    <p className="AddButton"> Add My Question </p>
                            }
                        </Mutation>
                    </div>
                </div>
            </div>
        );
    }
}
export default AddQuestion;
