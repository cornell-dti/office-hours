import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const CREATE_ASSIGNMENT = gql`
    mutation CreateAssignment($courseId: Int!, $name: String!, $activated: Boolean!, $childNames: [String]!, 
        $childActivateds:[Int]!) {
        apiCreatePrimaryTag(input: {_courseId: $courseId, _iname: $name, _activated: $activated, 
            _childNames: $childNames, _childActivateds:$childActivateds}) {
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
        if (this.props.tag) {
            this.state = {
                tag: this.props.tag,
                newTagText: ''
            };
        } else {
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

    handleNewTagEnter = (): void => {
        var newTag: AppTag = {
            activated: true,
            level: 2,
            tagId: -1,
            name: this.state.newTagText
        };
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
        this.setState({ newTagText: '' });
    }

    handleRemoveChildTag = (index: number): void => {
        if (!this.state.tag.tagRelationsByParentId) {
            return;
        }
        var newChildTags = Object.assign({}, this.state.tag.tagRelationsByParentId);
        this.setState({
            tag: {
                ...this.state.tag,
                tagRelationsByParentId:
                    { nodes: newChildTags.nodes.filter((value, i) => i !== index) }
            }
        });
    }

    handleCreateAssignment = (CreateAssignment: Function): void => {
        var childNames: string[] = [];
        var childActivateds: boolean[] = [];
        if (this.state.tag.tagRelationsByParentId) {
            childNames = this.state.tag.tagRelationsByParentId.nodes.map((childTag) => childTag.tagByChildId.name);
            childActivateds = this.state.tag.tagRelationsByParentId.nodes.map((childTag) =>
                childTag.tagByChildId.activated);
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
                            />
                        </div>
                    </div>
                    <div className="Status InputSection">
                        <div className="InputHeader">Status</div>
                        <div
                            className={'ActiveButton ' + (this.state.tag.activated ? 'Selected' : '')}
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
                    <div className="ChildTags InputSection">
                        <div className="InputHeader">Tags</div>
                        {
                            this.state.tag.tagRelationsByParentId &&
                            this.state.tag.tagRelationsByParentId.nodes.map((childTag, i) => {
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
                        <Icon
                            className={'InputChildTagEnter ' + (this.state.newTagText.length > 0 ? '' : 'disabled')}
                            name="check"
                            onClick={this.handleNewTagEnter}
                        />
                    </div>
                </div>
                <div className="EditButtons">
                    <button className="Bottom Cancel" onClick={() => this.props.cancelCallback()}>
                        Cancel
                    </button>
                    {this.props.isNew ?
                        <Mutation mutation={CREATE_ASSIGNMENT} onCompleted={() => this.props.refreshCallback()}>
                            {(CreateAssignment) =>
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
                        <button className="Bottom Edit" >
                            Save Changes
                        </button>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default ProfessorTagInfo;
