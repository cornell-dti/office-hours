import * as React from 'react';

import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import SelectedTags from '../includes/SelectedTags';
import SessionAlertModal from './SessionAlertModal';
import * as moment from 'moment';

const ADD_QUESTION = gql`
mutation AddQuestion($content: String!, $tags: [Int], $sessionId: Int!, $location: String!) {
    apiAddQuestion(
        input: {
            _content: $content,
            _tags: $tags,
            _status: "unresolved",
            _sessionId: $sessionId,
            _location: $location
        }) {
        clientMutationId
    }
}
`;
const LOCATION_CHAR_LIMIT = 40;
const WARNING_THRESHOLD = 10; // minutes left in queue

class AddQuestion extends React.Component {
    /*
     * State machine states
     * 10 - initial state - nothing selected, secondary & text fields locked
     * 20 - primary selected - shows a single primary tag, unlocks secondary
     * 30 - one or more secondary tags selected - unlocks location field
     * 40 - location inputted - unlocks question field
     * 50 - contents in question field - unlocks submit button
     * 60 - Warning modal (replaces question modal) - toggles after submit if n minutes are left in queue
     */
    props: {
        tags: AppTagRelations[]
        sessionId: number,
        courseId: number,
        callback: Function,
        charLimit: number,
        endTime: Date
    };

    state: {
        location: string,
        question: string,
        selectedTags: number[],
        stage: number,
        redirect: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            location: '',
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
            // Temporary; needs to be factored out into a course setting
            // Restrict to only one secondary tag (can be made shorter!):
            var selectedTags = [];
            for (var i = 0; i < this.state.selectedTags.length; i++) {
                var keep = false;
                for (var j = 0; j < this.props.tags.length; j++) {
                    if (this.props.tags[j].tagId === this.state.selectedTags[i]) {
                        keep = this.props.tags[j].level === 1;
                        break;
                    }
                }
                if (keep) {
                    selectedTags.push(this.state.selectedTags[i]);
                }
            }
            selectedTags.push(id);
            let stage;
            if (this.state.location.length > 0) {
                if (this.state.question.length > 0) {
                    stage = 50;
                } else { stage = 40; }
            } else { stage = 30; }
            this.setState({
                stage: stage,
                // selectedTags: [...this.state.selectedTags, id]
                selectedTags: selectedTags
            });
        } else {
            this.setState({
                stage: 20,
                selectedTags: this.state.selectedTags.filter((t) => t !== id)
            });
        }
    }

    public handleUpdateLocation = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        let stage;
        if (target.value.length > 0) {
            if (this.state.question.length > 0) {
                stage = 50;
            } else { stage = 40; }
        } else { stage = 30; }
        this.setState({
            location: target.value.length <= LOCATION_CHAR_LIMIT ? target.value : this.state.location,
            stage: stage
        });
    }

    public handleUpdateQuestion = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        this.setState({
            question: target.value.length <= this.props.charLimit ? target.value : this.state.question,
            stage: target.value.length > 0 ? 50 : 40
        });
    }

    public handleJoinClick = (event: React.MouseEvent<HTMLElement>, addQuestion: Function): void => {
        // this.setState({
        //     stage: 60
        // });
        if (this.state.stage !== 60 &&
            (moment().add(WARNING_THRESHOLD, 'minutes')).isAfter(this.props.endTime)) {
            this.setState({
                stage: 60
            });
        } else {
            addQuestion({
                variables: {
                    content: this.state.question,
                    tags: this.state.selectedTags,
                    sessionId: this.props.sessionId,
                    location: this.state.location
                }
            });
        }
        // addQuestion({
        //     variables: {
        //         content: this.state.question,
        //         tags: this.state.selectedTags,
        //         sessionId: this.props.sessionId,
        //         location: this.state.location
        //     }
        // });
    }

    public handleKeyPressDown = (event: React.KeyboardEvent<HTMLElement>, addQuestion: Function): void => {
        // CTRL + ENTER or CMD + ENTER adds the question ONLY if cursor in Question textbox
        if (!event.repeat && (event.ctrlKey || event.metaKey) && event.keyCode === 13 && this.state.stage > 40) {
            addQuestion({
                variables: {
                    content: this.state.question,
                    tags: this.state.selectedTags,
                    sessionId: this.props.sessionId,
                    location: this.state.location
                }
            });
        } else if (!event.repeat && event.keyCode === 27) {
            this.handleXClick();
        }
    }

    public questionAdded = () => {
        this.props.callback();
        this.setState({ redirect: true });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to={'/course/' + this.props.courseId + '/session/' + this.props.sessionId} />;
        }

        var charsRemaining = this.props.charLimit - this.state.question.length;

        return (
            <div className="QuestionView">
                {this.state.stage < 60 ? (
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
                                            this.state.stage <= 10 ||
                                            this.state.selectedTags.indexOf(tag.tagId) !== -1
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
                                        .filter((tag) => tag.activated && tag.level === 2)
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
                                <p className="header">
                                    Question <span
                                        className={'characterCount ' + (charsRemaining <= 0 ? 'warn' : '')}
                                    >
                                        ({charsRemaining} character{charsRemaining !== 1 && 's'} left)
                                    </span>
                                </p>
                                {this.state.stage >= 30 ?
                                    <textarea
                                        className="QuestionInput"
                                        value={this.state.question}
                                        onChange={this.handleUpdateQuestion}
                                        placeholder="What's your question about?"
                                    />
                                    : <p className="placeHolder text">Finish selecting tags...</p>}
                            </div>
                            <Mutation mutation={ADD_QUESTION} onCompleted={this.questionAdded}>
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
                ) : (
                        <SessionAlertModal
                            color={'yellow'}
                            description={'This session ends at ' + moment(this.props.endTime).format('h:mm A')
                                + '. Consider adding yourself to a later queue.'}
                            buttons={['Cancel Question', 'Add Anyway']}
                            cancelAction={this.handleXClick}
                            mainAction={this.handleXClick}
                            displayModalShade={false}
                        />
                    )}
            </div>
        );
    }
}
export default AddQuestion;
