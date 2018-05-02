import * as React from 'react';
import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';
import Moment from 'react-moment';

class SessionQuestionsComponent extends React.Component {

    props: {
        questionId: number,
        studentPicture: string,
        studentName: string,
        studentQuestion: string,
        tags: Tag[],
        index: number,
        isTA: boolean,
        time: string,
        isMyQuestion: boolean,
        handleShowClick: Function
    };

    state: {
        redirect: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            redirect: false
          };
        this.handleClick = this.handleClick.bind(this);
        this._onClickDelete = this._onClickDelete.bind(this);
        this._onClickResolve = this._onClickResolve.bind(this);
    }

    // Given an index from [1..n], converts it to text that is displayed
    // on the question cards. 1 => "NOW", 2 => "2nd", 3 => "3rd", and so on.
    getDisplayText(index: number): string {
        index++;
        if (index === 1) {
            return 'NOW';
        } else {
            // Disclaimer: none of us wrote this one-line magic :)
            // It is borrowed from https://stackoverflow.com/revisions/39466341/5
            return index + ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || index  + 'th';
        }
    }

    public handleClick(event: React.MouseEvent<HTMLElement>): void {
        this.setState({ redirect: true });
    }

    _onClickDelete() {
      this.props.handleShowClick(this.props.questionId, "deleted")
    }

    _onClickResolve() {
      this.props.handleShowClick(this.props.questionId, "resolved")
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to={'/session/1'} />;
        }

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
                            <p className="Delete" onClick={this._onClickDelete}><Icon name="close" /> Delete</p>
                            <p className="Resolve" onClick={this._onClickResolve}><Icon name="check" /> Resolve</p>
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
