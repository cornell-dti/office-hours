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
        newTags: string[]
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
            newTagText: '',
            newTags: []
        };
    }

    componentWillReceiveProps(props: { tag?: FireTag }) {
        //check if need to deal with childTags: FireTag[]
        //I think we might not be able to use batch() if there are existing children
        if (props.tag) {
            this.setState({
                tag: props.tag,
                newTagText: '',
                newTags: [] // TO DO: check if this should be [] or childTags or soemthing like that
            });
        } else {
            this.setState({
                tag: {
                    level: 1,
                    active: true,
                    tagId: '', // new tag
                    name: ''
                },
                newTagText: '',
                newTags: []
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

    helperAddMultipleNewChildTags(newTags: string[]) {
        // possibly changing the input to be ()
        // take newTags from this.state.newTags
        // will need to update this.state.new
        var batch = firestore.batch();

        // need to create this first so the children tags have the doc reference
        var parentTag = firestore.collection("tags").doc();
        batch.set(parentTag, {
            active: this.state.tag.active,
            courseId: this.state.tag.courseId,
            level: 1,
            name: this.state.tag.name
        });
        // this.setState({ (this.state.tag.tagId): parentTag.id })
        // not sure how I want to update this
        // because we create the ref to the parent/level 1 tag,
        // we should be able to update the state to include it but it might
        // not even be necessary

        // below is essentially helperAddNewChildTag
        newTags.forEach((tagText) => {
            var childTag = firestore.collection("tags").doc();
            batch.set(childTag, {
                active: this.state.tag.active,
                courseId: this.state.tag.courseId,
                level: 2,
                name: tagText,
                parentTag: parentTag
            })
        });

        batch.commit()
            .then(function () {
                // Successful upload
                console.log("batch successful");
            })
            .catch(function (error: string) {
                // Unsuccessful upload
                console.log(error);
                console.log("batch did not work");
            });
    }

    // this will be unused once batch writes are in place with confirm/submit
    // buttons functioning, same with handleRemoveChildTag
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
        // let newTag: FireTag = {
        //     active: true,
        //     level: 2,
        //     tagId: '',
        //     name: this.state.newTagText,
        //     courseId: firestore.collection('courses').doc(this.props.courseId)
        // };
        // this.helperAddNewChildTag(newTag);

        // update state.newTags: string[] to include the newTagText below and then
        // also update state.newTagText to be ''
        this.setState({ newTagText: '' });
    }

    // this will be unused once batch writes are in place with confirm/submit
    // buttons functioning, somehow need a way to store which tags we want deleted
    // and figure out the details specifically of keeping the others intact
    // probably also just using a batch delete
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
        this.helperAddMultipleNewChildTags(this.state.newTags);
        //might just rename the function above to deal with this
    }

    handleEditAssignment = (): void => {
        console.log('RYAN_TODO update tag and children');
        //not sure about this yet!
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
                            onClick={() => {
                                this.handleCreateAssignment();
                                this.props.cancelCallback();
                            }}
                        >
                            Create
                        </button>
                        :
                        <button
                            className="Bottom Edit"
                        // onClick={() => {
                        //     this.handleEditAssignment();
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
