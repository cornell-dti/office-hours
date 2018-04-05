import * as React from 'react';

class SessionQuestionsComponent extends React.Component {
    // constructor(props: any) {
    //     super(props);
    //     this.state = {name: this.props.name };
    // }

    props: {
        handleClick: Function,
        studentQuestion: string,
        tags: string[],
        order: string,
        times: string,
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
            (tag, index) => {
                return <p key={index}>{tag}</p>;
            }
        );

        return (
            <div className="QueueQuestions" onClick={() => this.toggleDetails(true)}>
                <p className="Question">{this.props.studentQuestion}</p>
                <div className="Tags">
                    {tagsList}
                </div>
                <div className="BottomBar">
                    <p className="Order">{this.props.order}</p>
                    <p className="Time">{this.props.times}</p>
                </div>
            </div>
        );
    }
}

export default SessionQuestionsComponent;
