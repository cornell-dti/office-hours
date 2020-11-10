import * as React from 'react';

import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';

import { addQuestion } from 'lib/student/question';
import SelectedTags from './SelectedTags';
import SessionAlertModal from './SessionAlertModal';

const LOCATION_CHAR_LIMIT = 40;
const WARNING_THRESHOLD = 10; // minutes left in queue

type Props = {
    session: FireSession;
    course: FireCourse;
    mobileBreakpoint: number;
};

type State = {
    location: string;
    question: string;
    selectedTags: number[];
    stage: number;
    width: number;
    redirect: boolean;
    tags: FireTag[];
    selectedPrimary?: FireTag;
    selectedSecondary?: FireTag;
};

class AddQuestion extends React.Component<Props, State> {
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
        redirect: false,
        tags: []
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
    };

    handleXClick = () => {
        this.setState({ redirect: true });
    };

    public handlePrimarySelected = (tag: FireTag | undefined): void => {
        if (this.state.selectedPrimary) {
            if (this.state.selectedPrimary.tagId === tag?.tagId) {
                this.setState({ stage: 10, selectedPrimary: undefined, selectedSecondary: undefined});
            } else {
                this.setState({ selectedPrimary: tag, 
                    selectedSecondary: undefined });
            }
        } else {
            this.setState(({ stage }) => stage <= 10
                ? { stage: 20, selectedPrimary: tag }
                : { stage: 10, selectedPrimary: undefined, selectedSecondary: undefined }
            );
        }
        
    };

    public handleSecondarySelected = (tag: FireTag): void => {
        if (this.state.selectedSecondary) {
            if (this.state.selectedSecondary.tagId === tag.tagId) {
                this.setState({ stage: 20, selectedSecondary: undefined });
            } else {
                this.setState({ selectedSecondary: tag });
            }
        } else if (!('building' in this.props.session)) {
            this.setState({ stage: 40 , selectedSecondary: tag });
        } else {
            this.setState({ stage: 30, selectedSecondary: tag });
        }
    };

    public handleUpdateLocation = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        let stage: number;
        if (target.value.length > 0) {
            if (this.state.question.length > 0) {
                stage = 50;
            } else { stage = 40; }
        } else { stage = 30; }

        if (this.props.session.modality === 'in-person') {
            this.setState(({ location }) => ({
                location: target.value.length <= LOCATION_CHAR_LIMIT ? target.value : location,
                stage
            }));
        } else {
            this.setState(() => ({
                location: target.value,
                stage
            }));
        }
    };

    public handleUpdateQuestion = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        this.setState(({ question }) => ({
            question: target.value.length <= this.props.course.charLimit ? target.value : question,
            stage: target.value.length > 0 ? 50 : 40
        }));
    };



    public handleJoinClick = (): void => {
        if (this.state.stage !== 60 &&
            (moment().add(WARNING_THRESHOLD, 'minutes')).isAfter(this.props.session.endTime.seconds * 1000)) {
            this.setState({ stage: 60 });
        } else if (this.state.selectedPrimary && this.state.selectedSecondary) {
            addQuestion(
                this.props.session.sessionId,
                this.props.session.modality,
                this.state.question,
                this.state.selectedPrimary.tagId,
                this.state.selectedSecondary.tagId,
                this.state.location);
        }
    };

    public handleKeyPressDown = (event: React.KeyboardEvent<HTMLElement>) => {
        // CTRL + ENTER or CMD + ENTER adds the question ONLY if cursor in Question textbox
        if ((!event.repeat && (event.ctrlKey || event.metaKey) && event.keyCode === 13 && this.state.stage > 40)) {
            if (this.state.selectedPrimary && this.state.selectedSecondary) {
                addQuestion(this.props.session.sessionId,
                    this.props.session.modality,
                    this.state.question,
                    this.state.selectedPrimary.tagId,
                    this.state.selectedSecondary.tagId,
                    this.state.location);
            }
        } else if (!event.repeat && event.keyCode === 27) {
            this.handleXClick();
        }
    };

    public questionAdded = () => this.setState({ redirect: true });
    render() {
        if (this.state.redirect) {
            return (
                <Redirect
                    push={true}
                    to={'/course/' + this.props.course.courseId + '/session/' + this.props.session.sessionId}
                />
            );
        }

        const { selectedPrimary, selectedSecondary } = this.state;

        return (
            <div className="QuestionView" onKeyDown={(e) => this.handleKeyPressDown(e)} >
                {(this.state.stage < 60 || this.state.width < this.props.mobileBreakpoint) &&
                    <div className="AddQuestion">
                        <div className="queueHeader">
                            <p className="title">Join The Queue</p>
                        </div>
                        <div className="tagsContainer">
                            <hr />
                            <div className="tagsMiniContainer">
                                <p className="header">Select a Category</p>
                                <div className="QuestionTags">
                                    {!selectedPrimary ?
                                        this.state.tags
                                            // Only show primary tags
                                            .filter((tag) => tag.active && tag.level === 1)
                                            // iff tag is selected, hide other primary tags
                                            .map((tag) => (<SelectedTags
                                                key={tag.tagId}
                                                tag={tag}
                                                isSelected={this.state.stage > 10}
                                                onClick={() => this.handlePrimarySelected(tag)}
                                                check={false}
                                                isPrimary={true}
                                                select={true}
                                            />))
                                        : this.state.tags
                                        // Only show primary tags
                                            .filter((tag) => tag.active && tag.level === 1)
                                        // iff tag is selected, hide other primary tags
                                            .map((tag) => (<SelectedTags
                                                key={tag.tagId}
                                                tag={tag}
                                                isSelected={this.state.stage > 10}
                                                onClick={() => this.handlePrimarySelected(tag)}
                                                check={tag === selectedPrimary}
                                                isPrimary={true}
                                                select={true}
                                            />))
                                    }
                                </div>
                            </div>
                            <hr />
                            <div className={'tagsMiniContainer secondaryTags ' + (!!selectedPrimary)}>
                                <p className="header">Select a Tag</p>
                                {selectedPrimary ?
                                    this.state.tags
                                        .filter((tag) => tag.active && tag.level === 2)
                                        .filter((tag) => (tag.parentTag === selectedPrimary.tagId))
                                        .map((tag) => (<SelectedTags
                                            key={tag.tagId}
                                            tag={tag}
                                            isSelected={selectedSecondary === tag}
                                            onClick={() => this.handleSecondarySelected(tag)}
                                            check={tag === selectedSecondary}
                                            select={true}
                                        />))
                                    : <p className="placeHolder">First select a category</p>}
                            </div>
                            <hr />
                            {'building' in this.props.session && <> <div className="tagsMiniContainer">
                                {<p className="header">
                                    Location or Zoom Link &nbsp;{
                                        this.props.session.modality === 'in-person' && <span
                                            className={
                                                'characterCount ' +
                                                (this.state.location.length >= LOCATION_CHAR_LIMIT ? 'warn' : '')
                                            }
                                        >
                                            (
                                            {LOCATION_CHAR_LIMIT - this.state.location.length}
                                            {' '}
                                        character{LOCATION_CHAR_LIMIT - this.state.location.length !== 1 && 's'} left
                                        )
                                        </span>}
                                </p>}
                                {this.state.stage >= 30 ?
                                    <div className="locationInput">
                                        <Icon name="map marker alternate" />
                                        <textarea
                                            className="TextInput location"
                                            value={this.state.location}
                                            onChange={this.handleUpdateLocation}
                                            placeholder="What is your zoom link?"
                                        />
                                    </div>
                                    : <p className="placeHolder text">Finish selecting tags...</p>}
                            </div><hr /></>
                            }
                            <div className="tagsMiniContainer">
                                <p className="header">
                                    {'Question '}
                                </p>
                                {this.state.stage >= 40 ?
                                    <textarea
                                        className="TextInput question"
                                        value={this.state.question}
                                        onChange={this.handleUpdateQuestion}
                                        placeholder="What's your question about?"
                                    />
                                    : <textarea
                                        disabled
                                        className="TextInput question"
                                        value={this.state.question}
                                        onChange={this.handleUpdateQuestion}
                                        placeholder={
                                            !('building' in this.props.session)
                                                ? "First select a category and a tag" : "Enter your location..."
                                        }
                                    />}
                                    
                            </div>
                            <div className="addButtonWrapper">
                                {this.state.stage > 40 ?
                                    <p className="AddButton active" onClick={() => this.handleJoinClick()} >
                                        Add My Question
                                    </p>
                                    : <p className="AddButton"> Add My Question </p>
                                }
                            </div>
                        </div>
                    </div>}
                {this.state.stage === 60 &&
                    <SessionAlertModal
                        header={'Warning'}
                        icon={'exclamation'}
                        color={'yellow'}
                        description={'This session ends at '
                            + moment(this.props.session.endTime.seconds * 1000).format('h:mm A')
                            + '. Consider adding yourself to a later queue.'}
                        buttons={['Cancel Question', 'Add Anyway']}
                        cancelAction={this.handleXClick}
                        course={this.props.course}
                        mainAction={() => this.handleJoinClick()}
                        displayShade={this.state.width < this.props.mobileBreakpoint}
                    />
                }
            </div>
        );
    }
}
export default AddQuestion;
