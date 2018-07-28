import * as React from 'react';

import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import SelectedTags from '../includes/SelectedTags';

const ADD_QUESTION = gql`
mutation AddQuestion($content: String!, $tags: [Int], $sessionId: Int!) {
    apiAddQuestion(
        input: {
            _content: $content,
            _tags: $tags,
            _status: "unresolved",
            _sessionId: $sessionId
        }) {
        clientMutationId
    }
}
`;

class AddQuestion extends React.Component {
    /*
     * State machine states
     * 10 - initial state - nothing selected, secondary & text field locked
     * 20 - primary selected - shows a single primary tag, unlocks secondary
     * 30 - one or more secondary tags selected - unlocks text field
     * 40 - contents in text field - unlocks submit button
     */
    props: {
        tags: AppTagRelations[]
        sessionId: number,
        courseId: number,
    };

    state: {
        question: string,
        selectedTags: number[],
        stage: number,
        redirect: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            question: '',
            stage: 10,
            selectedTags: [],
            redirect: false
        };
    }

    public handleXClick = () => {
        this.setState({ redirect: true });
    }

    public handlePrimarySelected = (id: number): void => {
        if (this.state.stage <= 10) {
            this.setState({
                stage: 20,
                selectedTags: [id]
            });
        } else {
            this.setState({ stage: 10, selectedTags: [] });
        }
    }

    public handleSecondarySelected = (deselected: boolean, id: number): void => {
        if (!deselected) {
            this.setState({
                stage: this.state.question.length > 0 ? 40 : 30,
                selectedTags: [...this.state.selectedTags, id]
            });
        } else if (this.state.selectedTags.length > 2) {
            this.setState({
                stage: this.state.question.length > 0 ? 40 : 30,
                selectedTags: this.state.selectedTags.filter((t) => t !== id)
            });
        } else {
            this.setState({
                stage: 20,
                selectedTags: this.state.selectedTags.filter((t) => t !== id)
            });
        }
    }

    public handleUpdateQuestion = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        this.setState({
            question: target.value.length <= 100 ? target.value : this.state.question,
            stage: target.value.length > 0 ? 40 : 30
        });
    }

    public handleJoinClick = (event: React.MouseEvent<HTMLElement>, addQuestion: Function): void => {
        addQuestion({
            variables: {
                content: this.state.question,
                tags: this.state.selectedTags,
                sessionId: this.props.sessionId
            }
        });
        this.setState({ redirect: true });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to={'/course/' + this.props.courseId + '/session/' + this.props.sessionId} />;
        }

        return (
            <div className="QuestionView">
                <div className="AddQuestion">
                    <div className="queueHeader">
                        <p className="xbutton" onClick={this.handleXClick}><Icon name="close" /></p>
                        <p className="title">Join The Queue</p>
                    </div>
                    <div className="tagsContainer">
                        <hr />
                        <div className="tagsMiniContainer">
                            <p className="header">Categories</p>
                            <div className="QuestionTags">
                                {this.props.tags
                                    .filter((tag) => tag.activated && tag.level === 1)
                                    .filter((tag) =>
                                        this.state.stage <= 10 || this.state.selectedTags.indexOf(tag.tagId) !== -1
                                    )
                                    .map((tag) => (<SelectedTags
                                        key={tag.tagId}
                                        tag={tag.name}
                                        level={1}
                                        isSelected={this.state.stage > 10}
                                        onClick={() => this.handlePrimarySelected(tag.tagId)}
                                    />))
                                }
                            </div>
                        </div>
                        <hr />
                        <div className="tagsMiniContainer">
                            <p className="header">Tags</p>
                            {this.state.stage >= 20 ?
                                this.props.tags
                                    .filter((tag) => tag.level === 2)
                                    .filter((tag) => this.state.selectedTags.indexOf(
                                        tag.tagRelationsByChildId.nodes[0].parentId)
                                        !== -1)
                                    .map((tag) => (<SelectedTags
                                        key={tag.tagId}
                                        tag={tag.name}
                                        level={2}
                                        isSelected={this.state.selectedTags.indexOf(tag.tagId) !== -1}
                                        onClick={() => this.handleSecondarySelected(
                                            this.state.selectedTags.indexOf(tag.tagId) !== -1, tag.tagId)
                                        }
                                    />))
                                : <p className="placeHolder">Select a category</p>}
                        </div>
                        <hr />
                        <div className="tagsMiniContainer">
                            <p className="header">Question</p>
                            {this.state.stage >= 30 ?
                                <textarea
                                    className="QuestionInput"
                                    value={this.state.question}
                                    onChange={this.handleUpdateQuestion}
                                    placeholder="What's your question about?"
                                />
                                : <p className="placeHolder text">Finish selecting tags...</p>}
                        </div>
                        <Mutation mutation={ADD_QUESTION}>
                            {(addQuestion) => this.state.stage > 30 ?
                                <p
                                    className="AddButton active"
                                    onClick={(e) => this.handleJoinClick(e, addQuestion)}
                                >
                                    Add My Question
                                </p>
                                : <p className="AddButton"> Add My Question </p>
                            }
                        </Mutation>
                    </div>
                </div>
            </div>
        );
    }
}
export default AddQuestion;
