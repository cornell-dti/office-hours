import * as React from 'react';

class SessionQuestionsComponent extends React.Component {
    // constructor(props: any) {
    //     super(props);
    //     this.state = {name: this.props.name };
    // }

    props: {
        handleClick: Function,
        studentName: string,
        studentQuestion: string,
        tags: Tag[],
        index: number
    };

    constructor(props: {}) {
        super(props);
        this.toggleDetails = this.toggleDetails.bind(this);
    }

    toggleDetails(prev: boolean) {
        this.props.handleClick(prev, this.props.index);
    }

    render() {
        var tagsList = this.props.tags.map(
            (tag) => {
                return <p key={tag.id}>{tag.value}</p>;
            }
        );

        return (
            <div className="QueueQuestions" onClick={() => this.toggleDetails(true)}>
                <p className="Name">{this.props.studentName}</p>
                <p className="Question">{this.props.studentQuestion}</p>
                <div className="Tags">
                    {tagsList}
                </div>
                <div className="BottomBar">
                    <button className="Button">Resolve</button>
                </div>
            </div>
        );
    }
}

export default SessionQuestionsComponent;
