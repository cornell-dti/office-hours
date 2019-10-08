import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const CREATE_ASSIGNMENT = gql`
    mutation CreateAssignment($courseId: Int!, $name: String!, $activated: Boolean!, $childNames: [String]!,
        $childActivateds:[Int]!) {
        apiCreatePrimaryTag(input: {_courseId: $courseId, _iname: $name, _activated: $activated,
            _childNames: $childNames, _childActivateds: $childActivateds}) {
            tags {
                tagId
            }
        }
    }
`;

const EDIT_ASSIGNMENT = gql`
    mutation EditAssignment($id: Int!, $name: String!, $activated: Boolean!, $childNames: [String]!,
        $childActivateds:[Int]!, $childIds: [Int]!) {
        apiEditPrimaryTag(input: {_parentId: $id, _iname: $name, _activated: $activated,
            _childNames: $childNames, _childActivateds: $childActivateds, _childIds: $childIds}) {
            tags {
                tagId
            }
        }
    }
`;

class ProfessorTagInfo extends React.Component {

    props: {
        isNew: boolean
        cancelCallback: Function
        tag?: AppTag
        refreshCallback: Function
        courseId: number
    };

    state: {
        tag: AppTag
        newTagText: string
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            tag: {
                level: 1,
                activated: true,
                tagId: -1, // new tag
                name: ''
            },
            newTagText: ''
        };
    }

    componentWillReceiveProps(props: { tag?: AppTag }) {
        if (props.tag) {
            this.setState({
                tag: props.tag,
                newTagText: ''
            });
        } else {
            this.setState({
                tag: {
                    level: 1,
                    activated: true,
                    tagId: -1, // new tag
                    name: ''
                },
                newTagText: ''
            });
        }
    }

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        var newState = Object.assign({}, this.state.tag);
        const target = event.target;
        newState.name = target.value;
        this.setState({ tag: newState });
    }

    handleNewTagTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;
        this.setState({ newTagText: target.value });
    }

    handleActiveChange = (active: boolean): void => {
        var newState = Object.assign({}, this.state.tag);
        newState.activated = active;
        this.setState({ tag: newState });
    }

    helperAddNewChildTag(newTag: AppTag) {
        if (this.state.tag.tagRelationsByParentId) {
            this.setState({
                tag: {
                    ...this.state.tag,
                    tagRelationsByParentId:
                        { nodes: [...this.state.tag.tagRelationsByParentId.nodes, { tagByChildId: newTag }] }
                }
            });
        } else {
            var newState = Object.assign({}, this.state.tag);
            newState.tagRelationsByParentId = { nodes: [{ tagByChildId: newTag }] };
            this.setState({ tag: newState });
        }
    }

    handleNewTagEnter = (): void => {
        if (this.state.newTagText.length === 0) {
            return;
        }
        var newTag: AppTag = {
            activated: true,
            level: 2,
            tagId: -1,
            name: this.state.newTagText
        };
        this.helperAddNewChildTag(newTag);
        this.setState({ newTagText: '' });
    }

    // Sorry, this function is a bit of a mess. Please refactor it when you get spare time.
    // There are many corner cases to handle, so definitely test your implementation a lot!
    handleRemoveChildTag = (index: number): void => {
        // This case should never happen
        if (!this.state.tag.tagRelationsByParentId) {
            return;
        }
        var newChildTags = Object.assign({}, this.state.tag.tagRelationsByParentId);
        var filteredTags = newChildTags.nodes.filter((childTag) => childTag.tagByChildId.activated);
        var newChildTag = Object.assign({}, filteredTags[index]);
        newChildTag.tagByChildId = { ...newChildTag.tagByChildId, activated: false };
        var allTags = newChildTags.nodes;
        var newTags = [];
        var shownIndex = -1;
        var doneRemoving = false;
        // Loop through all the tags (activated and not activated) to find the tag that was
        // removed by the user. We want to match index to the index'th tag that is activated.
        // For all other tags, we want to add their previous version; for the removed tag, we
        // add its previous version with activated = false (stored in newChildTag).
        for (var i = 0; i < allTags.length; i++) {
            if (allTags[i].tagByChildId.activated) {
                shownIndex++;
            }
            if (shownIndex === index && !doneRemoving) {
                newTags.push(newChildTag);
                doneRemoving = true;
            } else {
                newTags.push(allTags[i]);
            }
        }
        this.setState({
            tag: {
                ...this.state.tag,
                tagRelationsByParentId:
                {
                    nodes: newTags
                }
            }
        });
    }

    handleCreateAssignment = (CreateAssignment: Function): void => {
        var childNames: string[] = [];
        var childActivateds: boolean[] = [];
        if (this.state.tag.tagRelationsByParentId) {
            var filteredDeleted = this.state.tag.tagRelationsByParentId.nodes
                .filter((childTag) => childTag.tagByChildId.activated);
            childNames = filteredDeleted.map((childTag) => childTag.tagByChildId.name);
            // Line below is redundant, since it will always be true, but I've kept it here
            // for verbosity
            childActivateds = filteredDeleted.map((childTag) => childTag.tagByChildId.activated);
        }

        CreateAssignment({
            variables: {
                courseId: this.props.courseId,
                name: this.state.tag.name,
                activated: this.state.tag.activated,
                childNames: childNames,
                childActivateds: childActivateds
            }
        });

        this.state = {
            tag: {
                level: 1,
                activated: true,
                tagId: -1, // new tag
                name: ''
            },
            newTagText: ''
        };
    }

    handleEditAssignment = (EditAssignment: Function): void => {
        var childIds: number[] = [];
        var childNames: string[] = [];
        var childActivateds: number[] = [];
        if (this.state.tag.tagRelationsByParentId) {
            var childTags = this.state.tag.tagRelationsByParentId.nodes;
            childIds = childTags.map((childTag) => childTag.tagByChildId.tagId);
            childNames = childTags.map((childTag) => childTag.tagByChildId.name);
            childActivateds = childTags.map((childTag) => childTag.tagByChildId.activated ? 1 : 0);
        }

        EditAssignment({
            variables: {
                id: this.state.tag.tagId,
                name: this.state.tag.name,
                activated: this.state.tag.activated,
                childIds: childIds,
                childNames: childNames,
                childActivateds: childActivateds
            }
        });
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
                            className={'ActiveButton first ' + (this.state.tag.activated ? 'Selected' : '')}
                            onClick={() => this.handleActiveChange(true)}
                        >
                            Active
                        </div>
                        <div
                            className={'ActiveButton ' + (this.state.tag.activated ? '' : 'Selected')}
                            onClick={() => this.handleActiveChange(false)}
                        >
                            Inactive
                        </div>
                    </div>
                    <div className="ChildTags InputSection" onKeyDown={(e) => this.handleEnterPress(e)}>
                        <div className="InputHeader">Tags</div>
                        {
                            this.state.tag.tagRelationsByParentId &&
                            this.state.tag.tagRelationsByParentId.nodes
                                .filter((childTag) => childTag.tagByChildId.activated)
                                .map((childTag, i) => {
                                    return (
                                        <div
                                            key={i}
                                            className="SelectedChildTag"
                                        >
                                            {childTag.tagByChildId.name}
                                            <Icon
                                                className="Remove"
                                                name="close"
                                                onClick={() => this.handleRemoveChildTag(i)}
                                            />
                                        </div>
                                    );
                                })
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
                        <Mutation mutation={CREATE_ASSIGNMENT} onCompleted={() => this.props.refreshCallback()}>
                            {(CreateAssignment: Function) =>
                                <button
                                    className="Bottom Edit"
                                    onClick={() => {
                                        this.handleCreateAssignment(CreateAssignment);
                                        this.props.cancelCallback();
                                    }}
                                >
                                    Create
                                </button>
                            }
                        </Mutation>
                        :
                        <Mutation mutation={EDIT_ASSIGNMENT} onCompleted={() => this.props.refreshCallback()}>
                            {(EditAssignment: Function) =>
                                <button
                                    className="Bottom Edit"
                                    onClick={() => {
                                        this.handleEditAssignment(EditAssignment);
                                        this.props.cancelCallback();
                                    }}
                                >
                                    Save Changes
                                </button>
                            }
                        </Mutation>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default ProfessorTagInfo;
