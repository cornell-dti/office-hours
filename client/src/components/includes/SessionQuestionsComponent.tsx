import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import Moment from 'react-moment';

class SessionQuestionsComponent extends React.Component {

    props: {
        studentPicture: string,
        studentName: string,
        studentQuestion: string,
        tags: Tag[],
        index: number,
        isTA: boolean,
        time: string,
        isMyQuestion: boolean
    };

    // Given an index from [1..n], converts it to text that is displayed
    // on the question cards. 1 => "NOW", 2 => "2nd", 3 => "3rd", and so on.
    getDisplayText(index: number): string {
        index++;
        if (index === 1) {
            return 'NOW';
        } else {
            // Disclaimer: none of us wrote this one-line magic :)
            // It is borrowed from https://stackoverflow.com/revisions/39466341/5
            return index + ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || 'th';
        }
    }

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
                    <p className="Order">{this.getDisplayText(this.props.index)}</p>
                    <p className="Time">{<Moment date={this.props.time} interval={0} format={'hh:mm A'} />}</p>
                </div>
                {
                    this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <div className="TAButtons">
                            <p className="Delete"><Icon name="close" /> Delete</p>
                            <p className="Resolve"><Icon name="check" /> Resolve</p>
                        </div>
                    </div>
                }
                {
                    this.props.isMyQuestion &&
                    <div className="Buttons">
                        <hr />
                        <p className="Remove"><Icon name="close" /> Remove</p>
                    </div>
                }
            </div>
        );
    }
}

export default SessionQuestionsComponent;
