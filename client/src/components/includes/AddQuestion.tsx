import * as React from 'react';

import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';

import SelectedTags from '../includes/SelectedTags';
import SessionAlertModal from './SessionAlertModal';
import moment from 'moment';

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

type Props = {
    tags: AppTagRelations[]
    sessionId: string,
    courseId: string,
    charLimit: number,
    endTime: Date,
    mobileBreakpoint: number
};

type State = {
    location: string,
    question: string,
    selectedTags: number[],
    stage: number,
    width: number,
    redirect: boolean
};

class AddQuestion extends React.Component<Props> {
    /*
     * State machine states
     * 10 - initial state - nothing selected, secondary & text fields locked
     * 20 - primary selected - shows a single primary tag, unlocks secondary
     * 30 - one or more secondary tags selected - unlocks location field
     * 40 - location inputted - unlocks question field
     * 50 - contents in question field - unlocks submit button
     * 60 - Warning modal (replaces question modal) - toggles after submit if n minutes are left in queue
     */
    state: State = {
        location: '',
        question: '',
        stage: 10,
        width: window.innerWidth,
        selectedTags: [],
        redirect: false
    };

    // Keep window size in state for conditional rendering
    componentDidMount() {
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth });
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

    public handleJoinClick = (addQuestion: Function): void => {
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
    }

    public handleKeyPressDown = (event: React.KeyboardEvent<HTMLElement>, addQuestion: Function): void => {
        // CTRL + ENTER or CMD + ENTER adds the question ONLY if cursor in Question textbox
        if ((!event.repeat && (event.ctrlKey || event.metaKey) && event.keyCode === 13 && this.state.stage > 40)) {
            this.handleJoinClick(addQuestion);
        } else if (!event.repeat && event.keyCode === 27) {
            this.handleXClick();
        }
    }

    public questionAdded = () => {
        this.setState({ redirect: true });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to={'/course/' + this.props.courseId + '/session/' + this.props.sessionId} />;
        }

        var questionCharsLeft = this.props.charLimit - this.state.question.length;

        return (
            <Mutation mutation={ADD_QUESTION} onCompleted={this.questionAdded}>
                {(addQuestion: Function) => (
                    <div className="QuestionView" onKeyDown={(e) => this.handleKeyPressDown(e, addQuestion)}>
                        {(this.state.stage < 60 || this.state.width < this.props.mobileBreakpoint) &&
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
                                                        this.state.selectedTags.indexOf(tag.tagId) !== -1,
                                                        tag.tagId)
                                                    }
                                                />))
                                            : <p className="placeHolder">Select a category</p>}
                                    </div>
                                    <hr />
                                    <div className="tagsMiniContainer">
                                        <p className="header">
                                            Location <span
                                                className={'characterCount ' +
                                                    (this.state.location.length >= 40 ? 'warn' : '')}
                                            >
                                                {this.state.location.length}/{LOCATION_CHAR_LIMIT}
                                            </span>
                                        </p>
                                        {this.state.stage >= 30 ?
                                            <div className="locationInput">
                                                <Icon name="map marker alternate" />
                                                <textarea
                                                    className="TextInput location"
                                                    value={this.state.location}
                                                    onChange={this.handleUpdateLocation}
                                                    placeholder="Where will you be?"
                                                />
                                            </div>
                                            : <p className="placeHolder text">Finish selecting tags...</p>}
                                    </div>
                                    <hr />
                                    <div className="tagsMiniContainer">
                                        <p className="header">
                                            Question <span
                                                className={'characterCount ' +
                                                    (questionCharsLeft <= 0 ? 'warn' : '')}
                                            >
                                                ({questionCharsLeft} character{questionCharsLeft !== 1 && 's'} left)
                                            </span>
                                        </p>
                                        {this.state.stage >= 40 ?
                                            <textarea
                                                className="TextInput question"
                                                value={this.state.question}
                                                onChange={this.handleUpdateQuestion}
                                                placeholder="What's your question about?"
                                            />
                                            : <p className="placeHolder text">Enter your location...</p>}
                                    </div>
                                    {this.state.stage > 40 ?
                                        <p
                                            className="AddButton active"
                                            onClick={() => this.handleJoinClick(addQuestion)}
                                        >
                                            Add My Question
                                        </p>
                                        : <p className="AddButton"> Add My Question </p>
                                    }
                                </div>
                            </div>}
                        {this.state.stage === 60 &&
                            <SessionAlertModal
                                header={'Warning'}
                                icon={'exclamation'}
                                color={'yellow'}
                                description={'This session ends at ' + moment(this.props.endTime).format('h:mm A')
                                    + '. Consider adding yourself to a later queue.'}
                                buttons={['Cancel Question', 'Add Anyway']}
                                cancelAction={this.handleXClick}
                                mainAction={() => this.handleJoinClick(addQuestion)}
                            />
                        }
                    </div>
                )}
            </Mutation>
        );
    }
}
export default AddQuestion;
