import * as React from 'react';

class ProfessorTagInfo extends React.Component {

    props: {
        isNew: boolean
        cancelCallback: Function
        tag?: AppTag
    };

    state: {
        tag: AppTag
    };

    constructor(props: {}) {
        super(props);
        if (this.props.tag) {
            this.state = {
                tag: this.props.tag
            };
        } else {
            this.state = {
                tag: {
                    level: 1,
                    activated: true,
                    tagId: -1, // new tag
                    name: ''
                }
            };
        }
    }

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        var newState = Object.assign({}, this.state.tag);
        const target = event.target;
        newState.name = target.value;
        this.setState({ tag: newState });
    }

    handleActiveChange = (active: boolean): void => {
        var newState = Object.assign({}, this.state.tag);
        newState.activated = active;
        this.setState({ tag: newState });
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
                            this.state.tag.tagRelationsByParentId.nodes.map((childTag) => {
                                return (
                                    <div
                                        key={childTag.tagByChildId.tagId}
                                        className="SelectedChildTag"
                                    >
                                        {childTag.tagByChildId.name}
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                <div className="EditButtons">
                    <button className="Bottom Cancel" onClick={() => this.props.cancelCallback()}>
                        Cancel
                    </button>
                    {this.props.isNew ?
                        <button className="Bottom Edit" >
                            Create
                        </button>
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
