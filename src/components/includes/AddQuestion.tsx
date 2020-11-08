import * as React from 'react';

import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';
import firebase from 'firebase/app';

import SelectedTags from './SelectedTags';
import SessionAlertModal from './SessionAlertModal';

import { collectionData, firestore, auth } from '../../firebase';

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

        const tags$ = collectionData<FireTag>(
            firestore
                .collection('tags')
                .where('courseId', '==', this.props.course.courseId),
            'tagId'
        );

        tags$.subscribe((tags) => this.setState({ tags }));
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
        this.setState(({ stage }) => stage <= 10
            ? { stage: 20, selectedPrimary: tag }
            : { stage: 10, selectedPrimary: undefined, selectedSecondary: undefined }
        );
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

    public addQuestion = () => {
        if (auth.currentUser != null && this.state.selectedPrimary != null &&
            this.state.selectedSecondary != null) {
            const batch = firestore.batch();
            const questionId = firestore.collection('questions').doc().id;
            const newQuestionSlot: Omit<FireQuestionSlot, 'questionId'> = {
                askerId: auth.currentUser.uid,
                sessionId: this.props.session.sessionId,
                status: 'unresolved',
                timeEntered: firebase.firestore.Timestamp.now()
            };

            const location = 'building' in this.props.session ? {} : { location: this.state.location };

            const newQuestion: Omit<FireQuestion, 'questionId'> = {
                ...newQuestionSlot,
                ...location,
                answererId: '',
                content: this.state.question,
                primaryTag: this.state.selectedPrimary.tagId,
                secondaryTag: this.state.selectedSecondary.tagId
            };
            batch.set(firestore.collection('questionSlots').doc(questionId), newQuestionSlot);
            batch.set(firestore.collection('questions').doc(questionId), newQuestion);
            batch.commit();

            this.setState({ redirect: true });
        }
    };

    public handleJoinClick = (): void => {
        if (this.state.stage !== 60 &&
            (moment().add(WARNING_THRESHOLD, 'minutes')).isAfter(this.props.session.endTime.seconds * 1000)) {
            this.setState({ stage: 60 });
        } else {
            this.addQuestion();
        }
    };

    public handleKeyPressDown = (event: React.KeyboardEvent<HTMLElement>) => {
        // CTRL + ENTER or CMD + ENTER adds the question ONLY if cursor in Question textbox
        if ((!event.repeat && (event.ctrlKey || event.metaKey) && event.keyCode === 13 && this.state.stage > 40)) {
            this.addQuestion();
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

        const questionCharsLeft = this.props.course.charLimit - this.state.question.length;
        return (
            <div className="QuestionView" onKeyDown={(e) => this.handleKeyPressDown(e)} >
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
                                            />))
                                        : <SelectedTags
                                            tag={selectedPrimary}
                                            isSelected={true}
                                            onClick={() => this.handlePrimarySelected(undefined)}
                                        />
                                    }
                                </div>
                            </div>
                            <hr />
                            <div className="tagsMiniContainer">
                                <p className="header">Tags</p>
                                {selectedPrimary ?
                                    this.state.tags
                                        .filter((tag) => tag.active && tag.level === 2)
                                        .filter((tag) => (tag.parentTag === selectedPrimary.tagId))
                                        .map((tag) => (<SelectedTags
                                            key={tag.tagId}
                                            tag={tag}
                                            isSelected={selectedSecondary === tag}
                                            onClick={() => this.handleSecondarySelected(tag)}
                                        />))
                                    : <p className="placeHolder">Select a category</p>}
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
                            </div>
                            <hr /></>}
                            <div className="tagsMiniContainer">
                                <p className="header">
                                    {'Question '}
                                    <span className={'characterCount ' + (questionCharsLeft <= 0 ? 'warn' : '')} >
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
                                    : (<p className="placeHolder text">{
                                        !('building' in this.props.session)
                                            ? "Select a tag..." : "Enter your location..."
                                    }</p>)}
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
