import * as React from 'react';
import { Icon } from 'semantic-ui-react';

import { Subscription } from 'rxjs';
import { logOut } from '../../firebasefunctions';
import { fireCoursesSingletonObservable } from '../../firehooks';

import QMeLogo from '../../media/QLogo2.svg';
import chevron from '../../media/chevron.svg'; // Replace with dropdown cheveron

class CalendarHeader extends React.Component {
    props!: {
        currentCourseCode: string;
        role?: string;
        avatar?: string;
    };

    state!: {
        showMenu: boolean;
        showCourses: boolean;
        courses: FireCourse[];
        userId?: string;
    };

    private readonly coursesSubscription: Subscription;

    constructor(props: {}) {
        super(props);
        this.state = { showMenu: false, showCourses: false, courses: fireCoursesSingletonObservable.get() };
        this.coursesSubscription = fireCoursesSingletonObservable.subscribe(courses => this.setState({ courses }));
    }

    componentWillUnmount() {
        this.coursesSubscription.unsubscribe();
    }

    setMenu = (status: boolean) => {
        this.setState({ showMenu: status });
    };

    setCourses = (status: boolean) => {
        this.setState({ showCourses: status });
    };

    render() {
        return (
            <div className="Header">
                <div className="LogoContainer">
                    <img src={QMeLogo} className="QMeLogo" alt="Queue Me In Logo" />
                </div>
                <div className="CalendarHeader" onClick={() => this.setCourses(!this.state.showCourses)}>
                    <span>
                        <span>{this.props.currentCourseCode}</span>
                        {this.props.role && this.props.role === 'ta' && <span className="TAMarker">TA</span>}
                        {this.props.role && this.props.role === 'professor' &&
                            <span className="TAMarker Professor">PROF</span>}
                        <span className="CourseSelect">
                            <img src={chevron} alt="Course Select" className="RotateDown" />
                        </span>
                    </span>
                    {this.props.avatar &&
                        <img
                            className="mobileHeaderFace"
                            onClick={(e) => {
                                e.stopPropagation();
                                this.setMenu(!this.state.showMenu);
                            }}
                            src={this.props.avatar}
                            alt="User avatar"
                        />
                    }
                    {this.state.showCourses &&
                        <ul className="courseMenu" tabIndex={1} onClick={() => this.setCourses(false)} >
                            {/* RYAN_TODO factor this out to a global settings/config thing on firebase */}
                            {this.state.courses.filter((c) => c.semester === 'FA19').map((course) =>
                                <li key={course.courseId}>
                                    <a
                                        href={'/course/' + course.courseId}
                                        onClick={() =>
                                            window.localStorage.setItem('lastid', String(course.courseId))}
                                    > {course.code}
                                    </a>
                                </li>
                            )}
                        </ul>
                    }
                </div>
                {this.state.showMenu && (
                    <ul className="logoutMenu" onClick={() => this.setMenu(false)} >
                        {/* RYAN_TODO: figure out what's the purpose of this code. */}
                        {/* {this.props.isTa &&
                            <React.Fragment>
                                <li>Cancel Session</li>
                                <li>Change Session</li>
                            </React.Fragment>
                        } */}
                        <li onClick={() => logOut()}> <span><Icon name="sign out" /></span>Log Out</li>
                        <li>
                            <a href="https://goo.gl/forms/7ozmsHfXYWNs8Y2i1" target="_blank" rel="noopener noreferrer">
                                <span><Icon name="edit" /></span>Send Feedback
                            </a>
                        </li>
                    </ul>
                )}
            </div>
        );
    }
}

export default CalendarHeader;
