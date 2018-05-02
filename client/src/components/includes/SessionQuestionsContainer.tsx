import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';

class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
        questions: Question[]
    };

    state: {
        redirect: boolean,
        undoId: number,
        undoStatus: string
    }

    constructor(props: {}) {
        super(props);
        this.state = {
            redirect: false,
            undoId: -1,
            undoStatus: ""
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleShowClick = this.handleShowClick.bind(this);
    }

    public handleClick(event: React.MouseEvent<HTMLElement>): void {
        this.setState({ redirect: true });
    }

    public handleShowClick(item: number, status: string) {
        this.setState({
            undoId: item,
            undoStatus: status
        });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to={'/session/1'} />;
        }

        var undoQuestionName = ""
        var questions = this.props.questions;
        var userQuestionIndex: number = 0;
        var cardList: JSX.Element[] = [];
        questions.forEach((question, i: number) => {
            if (question.id === this.state.undoId) undoQuestionName = question.name;
            if (question.userId === 100) {
                userQuestionIndex = i;
            }
            cardList.push(
                <SessionQuestionsComponent
                    key={question.id}
                    questionId={question.id}
                    studentName={question.name}
                    studentPicture={'https://i2.wp.com/puppypassionn.org/wp-content/' +
                        'uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1'}
                    studentQuestion={question.content}
                    time={question.timeEntered}
                    tags={question.tags}
                    index={i}
                    isTA={this.props.isTA}
                    isMyQuestion={false}
                    handleShowClick={this.handleShowClick}
                />
            );
        });

        var tagsList: JSX.Element[] = [];
        if (questions.length > 0 && userQuestionIndex !== -1) {
            tagsList = questions[userQuestionIndex].tags.map(
                (tag) => {
                    return <p key={tag.id}>{tag.name}</p>;
                }
            );
        }

        return (
            <div className="SessionQuestionsContainer" >
                {!this.props.isTA && questions.length > 0 && userQuestionIndex !== -1 &&
                    <div className="User">
                        <div className="UserQuestionHeader">
                            <p className="QuestionHeader">My Question</p>
                        </div>
                        {
                            <SessionQuestionsComponent
                                key={questions[userQuestionIndex].id}
                                questionId={questions[userQuestionIndex].id}
                                studentName={questions[userQuestionIndex].name}
                                studentPicture={'https://i2.wp.com/puppypassionn.org/wp-content/' +
                                    'uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1'}
                                studentQuestion={questions[userQuestionIndex].content}
                                time={questions[userQuestionIndex].timeEntered}
                                tags={questions[userQuestionIndex].tags}
                                index={userQuestionIndex}
                                isTA={this.props.isTA}
                                isMyQuestion={true}
                                handleShowClick={this.handleShowClick}
                            />
                        }
                    </div>
                }
                <div className="Undo">
                    <p className="XUndoButton" onClick={this.handleClick}><Icon name="close" /></p>
                    <div className="UndoInformation">
                        <p className="UndoText">{undoQuestionName} has been {this.state.undoStatus}!</p>
                        <p className="UndoButton" onClick={this.handleClick}>Undo</p>
                    </div>
                </div>
                <div>
                    <p className="Queue">Queue</p>
                </div>
                {questions.length > 0 && cardList}
                {
                    questions.length === 0 &&
                    (!this.props.isTA &&
                        <p className="noQuestionsWarning">No questions in the queue. Be the first!</p>
                        ||
                        <p className="noQuestionsWarning">No questions in the queue yet.</p>)
                }

            </div>
        );
    }
}

export default SessionQuestionsContainer;
