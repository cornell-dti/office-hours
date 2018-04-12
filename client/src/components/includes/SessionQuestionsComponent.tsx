import * as React from 'react';

class SessionQuestionsComponent extends React.Component {
    // constructor(props: any) {
    //     super(props);
    //     this.state = {name: this.props.name };
    // }

    props: {
        studentPicture: string,
        studentName: string,
        studentQuestion: string,
        tags: Tag[],
        index: number,
        isTA: boolean,
        time: string,
    };

    render() {
        var tagsList = this.props.tags.map(
            (tag) => {
                return <p key={tag.id}>{tag.name}</p>;
            }
        );

        return (
            <div className="QueueQuestions">
                {
                    this.props.isTA &&
                    <div className="studentInformation">
                        <img src={this.props.studentPicture} />
                        <p className="Name">{this.props.studentName}</p>
                    </div>
                }
                <p className="Question">{this.props.studentQuestion}</p>
                <div className="Tags">
                    {tagsList}
                </div>
                <div className="BottomBar">
                    <p className="Order">{this.props.index}</p>
                    <p className="Time">{this.props.time}</p>
                </div>
                {
                    this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <div className="Button">
                            <p className="Delete">X Delete</p>
                            <p className="Resolve">&#10004; Resolve</p>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default SessionQuestionsComponent;
