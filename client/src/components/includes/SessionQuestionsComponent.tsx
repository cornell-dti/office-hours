import * as React from 'react';

class SessionQuestionsComponent extends React.Component {
    // constructor(props: any) {
    //     super(props);
    //     this.state = {name: this.props.name };
    // }

    props: {
        handleClick: Function,
        studentPicture: string,
        studentName: string,
        studentQuestion: string,
        tags: string[],
        order: string,
        times: string,
        index: number,
        isTA: boolean
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
                { this.props.isTA ?
                  <div className="studentInformation">
                      <img src={this.props.studentPicture}/>
                      <p className="Name">{this.props.studentName}</p>
                  </div> : <div> </div>
                }
                <p className="Question">{this.props.studentQuestion}</p>
                <div className="Tags">
                    {tagsList}
                </div>
                <div className="BottomBar">
                    <p className="Order">{this.props.order}</p>
                    <p className="Time">{this.props.times}</p>
                </div>
                { this.props.isTA ?
                  <div className="Buttons">
                    <hr/>
                    <div className="Button">
                      <p className="Delete">X Delete</p>
                      <p className="Resolve">&#10004; Resolve</p>
                    </div>
                  </div> : <div> </div>
                }
            </div>
        );
    }
}

export default SessionQuestionsComponent;
