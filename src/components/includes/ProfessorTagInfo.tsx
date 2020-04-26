import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { firestore } from '../../firebase';

type PropTypes = {
    isNew: boolean;
    cancelCallback: Function;
    tag?: FireTag;
    courseId: string;
    childTags: FireTag[];
};

type State = {
    tag: FireTag;
    newTagText: string;
    newTags: string[];
};

class ProfessorTagInfo extends React.Component<PropTypes, State> {

    constructor(props: PropTypes) {
        super(props);
        this.state = {
            tag: {
                active: true,
                level: 1,
                tagId: '',
                name: '',
                courseId: props.courseId
            },
            newTagText: '',
            newTags: []
        };
    }

    componentWillReceiveProps(props: PropTypes) {
        if (props.tag) {
            this.setState({
                tag: props.tag,
                newTags: props.childTags.map(firetag => firetag.name)
            });
        }
    }

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const name = event.currentTarget.value;
        this.setState((state) => ({ tag: { ...state.tag, name } }));
    };

    handleNewTagTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;
        this.setState({ newTagText: target.value });
    };

    handleActiveChange = (active: boolean): void => {
        this.setState((state) => ({ tag: { ...state.tag, active } }));
    };

    handleNewTagEnter = (): void => {
        if (this.state.newTagText.length === 0) {
            return;
        }
        this.setState(prevState => ({
            newTags: [...prevState.newTags, prevState.newTagText],
            newTagText: ''
        }));
    };

    handleRemoveChildTag = (name: string): void => {
        this.setState(prevState => ({
            newTags: prevState.newTags.filter(tag => tag !== name)
        }));
    };

    clearState = (): void => {
        this.setState(
            {
                tag: {
                    active: true,
                    level: 1,
                    tagId: '',
                    name: '',
                    courseId: this.props.courseId
                },
                newTagText: '',
                newTags: []
            }
        );
    };

    handleCreateAssignment = (): void => {
        const batch = firestore.batch();

        // need to create this first so the child tags have the doc reference
        const parentTag = firestore.collection('tags').doc();
        batch.set(parentTag, {
            active: this.state.tag.active,
            courseId: this.state.tag.courseId,
            level: 1,
            name: this.state.tag.name
        });

        // converts reference parentTag to the string format stored in state
        this.setState((prevState) => ({ tag: { ...prevState.tag, tagId: parentTag.id } }));

        // below is essentially add new child a bunch of times
        this.state.newTags.forEach(tagText => {
            const childTag = firestore.collection('tags').doc();
            batch.set(childTag, {
                active: this.state.tag.active,
                courseId: this.state.tag.courseId,
                level: 2,
                name: tagText,
                parentTag: parentTag.id
            });
        });
        batch.commit();

        this.clearState();
    };

    handleEditAssignment = (): void => {
        const batch = firestore.batch();

        const parentTag = firestore.collection('tags').doc(this.state.tag.tagId);
        // deals w/ case where parent tag name is changed
        // no checking yet, like if A1 is changed to A0 but A0 already exists
        if (this.props.tag && this.state.tag.name !== this.props.tag.name) {
            batch.update(parentTag, { name: this.state.tag.name });
        }

        // deleted tags
        this.props.childTags
            .filter(firetag => !this.state.newTags.includes(firetag.name))
            .forEach(firetag =>
                batch.delete(firestore.collection('tags').doc(firetag.tagId)));

        // new tags
        const preexistingTags = this.props.childTags
            .filter(firetag => this.state.newTags.includes(firetag.name))
            .map(firetag => firetag.name);
        this.state.newTags
            .filter(tag => !preexistingTags.includes(tag))
            .forEach(tagText => {
                const childTag = firestore.collection('tags').doc();
                batch.set(childTag, {
                    active: this.state.tag.active,
                    courseId: this.state.tag.courseId,
                    level: 2,
                    name: tagText,
                    parentTag: parentTag.id
                });
            });

        batch.commit();
    };

    handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            this.handleNewTagEnter();
        }
    };

    render() {
        return (
            <>
                <div className="ProfessorTagInfo">
                    <div className="Assignment InputSection">
                        <div className="InputHeader">Assignment Name</div>
                        <div className="AssignmentInput">
                            <input
                                maxLength={30}
                                value={this.state.tag.name}
                                onChange={this.handleNameChange}
                                placeholder={'Example: \'Assignment 1\''}
                            />
                        </div>
                    </div>
                    <div className="Status InputSection">
                        <div className="InputHeader">Status</div>
                        <div
                            className={'ActiveButton first ' + (this.state.tag.active ? 'Selected' : '')}
                            onClick={() => this.handleActiveChange(true)}
                        >
                            Active
                        </div>
                        <div
                            className={'ActiveButton ' + (this.state.tag.active ? '' : 'Selected')}
                            onClick={() => this.handleActiveChange(false)}
                        >
                            Inactive
                        </div>
                    </div>
                    <div className="ChildTags InputSection" onKeyDown={(e) => this.handleEnterPress(e)}>
                        <div className="InputHeader">Tags</div>
                        {this.state.newTags
                            .map((childTag, i) => (
                                <div key={i} className="SelectedChildTag" >
                                    {childTag}
                                    <Icon
                                        className="Remove"
                                        name="close"
                                        onClick={() => this.handleRemoveChildTag(childTag)}
                                    />
                                </div>
                            ))
                        }
                        <input
                            className="InputChildTag"
                            maxLength={30}
                            onChange={this.handleNewTagTextChange}
                            placeholder="Type to add a new tag..."
                            value={this.state.newTagText}
                        />
                        <div
                            className={'InputChildTagEnter ' + (this.state.newTagText.length > 0 ? '' : 'disabled')}
                            onClick={this.handleNewTagEnter}
                        >
                            +
                        </div>
                    </div>
                </div>
                <div className="EditButtons">
                    <button type="button" className="Bottom Cancel" onClick={() => this.props.cancelCallback()}>
                        Cancel
                    </button>
                    {this.props.isNew ?
                        <button
                            type="button"
                            className="Bottom Edit"
                            onClick={() => {
                                this.handleCreateAssignment();
                                this.props.cancelCallback();
                            }}
                        >
                            Create
                        </button>
                        :
                        <button
                            type="button"
                            className="Bottom Edit"
                            onClick={() => {
                                this.handleEditAssignment();
                                this.props.cancelCallback();
                            }}
                        >
                            Save Changes
                        </button>
                    }
                </div>
            </>
        );
    }
}

export default ProfessorTagInfo;
