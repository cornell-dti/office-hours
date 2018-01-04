import * as React from 'react';
import '../../styles/DetailedQuestionView.css';

class DetailedQuestionView extends React.Component {
    props: {
        isDetailed: boolean,
        studentName: string,
        studentQuestion: string,
        tags: string[],
        group: string[],
        handleClick: Function
    };

    constructor(props: {}) {
        super(props);
        this._toggleDetails = this._toggleDetails.bind(this);
    }

    _toggleDetails(prev: boolean) {
        this.props.handleClick(prev)
    }

    render() {
        var tagsList = this.props.tags.map(
            function (tag) {
                return <p>{tag}</p>
            }
        )

        var groupList = this.props.group.map(
            function (member) {
                return <li>{member}</li>
            }
        )

        return (
            <div className="DetailedQuestionView">
                <div className="DetailedQuestionInfo">
                    <div className="StudentInfo">
                        <header>{this.props.studentName}</header>
                        <p>{this.props.studentQuestion}</p>
                    </div>
                    <div className="DetailedTags">
                        {tagsList}
                    </div>
                    <div className="GroupInfo">
                        <header>Students In This Group</header>
                        <ul>
                            {groupList}
                        </ul>
                    </div>
                </div>
                {/* <button className="DetailedResolveButton">Resolve</button> */}
                <button className="DetailedCloseButton " onClick={() => this._toggleDetails(false)}>Close</button>
            </div>
        );
    }
}

export default DetailedQuestionView;