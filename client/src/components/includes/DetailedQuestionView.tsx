import * as React from 'react';

class DetailedQuestionView extends React.Component {
    props: {
        studentName: string,
        studentQuestion: string,
        tags: string[],
        group: string[],
        isDetailed: boolean,
        handleClick: Function
    };

    constructor(props: {}) {
        super(props);
        this.toggleDetails = this.toggleDetails.bind(this);
    }

    toggleDetails(prev: boolean) {
        this.props.handleClick(prev);
    }

    render() {
        var tagsList = this.props.tags.map(
            (tag, index) => {
                return <p key={index}>{tag}</p>; /* Compiles with warning if key not included */
            }
        );

        var groupList = this.props.group.map(
            (member, index) => {
                return <li key={index}>{member}</li>;
            }
        );

        var popup = 'PopupInvisible';
        if (this.props.isDetailed) {
            popup = 'PopupVisible';
        }

        return (
            <div className={'DetailedQuestionView ' + popup}>
                <div className="DetailedQuestionInfo">
                    <div className="StudentInfo">
                        <header>{this.props.studentName}</header>
                        <p>{this.props.studentQuestion}</p>
                        <div className="DetailedTags">
                            {tagsList}
                        </div>
                    </div>
                    <div className="GroupInfo">
                        <header>Students In This Group</header>
                        <ul>
                            {groupList}
                        </ul>
                    </div>
                </div>
                {/* <button className="DetailedResolveButton">Resolve</button> */}
                <button className="DetailedCloseButton " onClick={() => this.toggleDetails(false)}>Close</button>
            </div>
        );
    }
}

export default DetailedQuestionView;