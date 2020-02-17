import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { firestore } from '../../firebase';

class ProfessorTagInfo extends React.Component {
    props!: {
        isNew: boolean
        cancelCallback: Function
        tag?: FireTag
        courseId: string
        childTags: FireTag[]
    };

    state!: {
        tag: FireTag
        newTagText: string
    };

    constructor(props: {
        isNew: boolean
        cancelCallback: Function
        tag?: FireTag
        courseId: string
        childTags: FireTag[]
    }) {
        super(props);
        this.state = {
            tag: {
                courseId: firestore.collection('courses').doc(props.courseId),
                level: 1,
                active: true,
                tagId: '', // new tag
                name: ''
            },
            newTagText: ''
        };
    }

    componentWillReceiveProps(props: { tag?: FireTag }) {
        if (props.tag) {
            this.setState({
                tag: props.tag,
                newTagText: ''
            });
        } else {
            this.setState({
                tag: {
                    level: 1,
                    active: true,
                    tagId: '', // new tag
                    name: ''
                },
                newTagText: ''
            });
        }
    }

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let newState = Object.assign({}, this.state.tag);
        const target = event.target;
        newState.name = target.value;
        this.setState({ tag: newState });
    }

    handleNewTagTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;
        this.setState({ newTagText: target.value });
    }

    handleActiveChange = (active: boolean): void => {
        let newState = Object.assign({}, this.state.tag);
        newState.active = active;
        this.setState({ tag: newState });
    }

    helperAddNewChildTag(newTag: FireTag) {
        firestore.collection('tags').add({
            active: newTag.active,
            courseId: newTag.courseId,
            level: newTag.level,
            name: newTag.name,
            parentTag: typeof newTag.parentTag === 'undefined' ? null : newTag.parentTag
        })
            .then(function () {
                // Successful upload
                // console.log("upload successful");
            })
            .catch(function (error: string) {
                // Unsuccessful upload
                // console.log(error);
                // console.log("did not work");
            });
    }

    handleNewTagEnter = (): void => {
        if (this.state.newTagText.length === 0) {
            return;
        }
        let newTag: FireTag = {
            active: true,
            level: 2,
            tagId: '',
            name: this.state.newTagText,
            courseId: firestore.collection('courses').doc(this.props.courseId)
        };
        this.helperAddNewChildTag(newTag);
        this.setState({ newTagText: '' });
    }

    handleRemoveChildTag = (id: string): void => {
        firestore.collection('tags').doc(id).delete()
            .then(function () {
                // Successful delete 
                // console.log("delete successful");
            })
            .catch(function (error: string) {
                // Unsuccessful delete
                // console.log(error);
                // console.log("delete did not work");
            });
    }

    handleCreateAssignment = (): void => {
        console.log('RYAN_TODO create tag and children');


    }

    handleEditAssignment = (): void => {
        console.log('RYAN_TODO update tag and children');

    }

    handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            this.handleNewTagEnter();
        }
    }

    render() {
        return (
            <React.Fragment>
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
                        {this.props.childTags
                            .filter((childTag) => childTag.active)
                            .map((childTag, i) => (
                                <div key={i} className="SelectedChildTag" >
                                    {childTag.name}
                                    <Icon
                                        className="Remove"
                                        name="close"
                                        onClick={() => this.handleRemoveChildTag(childTag.tagId)}
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
                    <button className="Bottom Cancel" onClick={() => this.props.cancelCallback()}>
                        Cancel
                    </button>
                    {this.props.isNew ?
                        <button
                            className="Bottom Edit"
                        // onClick={() => {
                        //     this.handleCreateAssignment(CreateAssignment);
                        //     this.props.cancelCallback();
                        // }}
                        >
                            Create
                        </button>
                        :
                        <button
                            className="Bottom Edit"
                        // onClick={() => {
                        //     this.handleEditAssignment(EditAssignment);
                        //     this.props.cancelCallback();
                        // }}
                        >
                            Save Changes
                        </button>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default ProfessorTagInfo;
