import * as React from 'react';
import { Icon } from 'semantic-ui-react';
// const QMeLogo = require('../../media/QMeLogo.svg');

import { collectionData, firestore, loggedIn$ } from '../../firebase';
import { docData } from 'rxfire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { logOut } from '../../firebasefunctions';

const QMeLogo = require('../../media/QLogo2.svg');
const chevron = require('../../media/chevron.svg'); // Replace with dropdown cheveron

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

    constructor(props: {}) {
        super(props);
        this.state = { showMenu: false, showCourses: false, courses: [], userId: undefined };

        // Look up courseIds for current user
        const courseUsers$ = loggedIn$.pipe(
            switchMap(user =>
                collectionData(
                    firestore
                        .collection('courseUsers')
                        .where('userId', '==', firestore.doc('users/' + user.uid)),
                    'courseUserId'
                ) as Observable<FireCourseUser[]>
            )
        );

        // Get courses that the user is enrolled in
        let courses$: Observable<FireCourse[]> = courseUsers$.pipe(
            switchMap((courseUsers: FireCourseUser[]) =>
                combineLatest(...courseUsers.map(courseUser =>
                    docData(firestore.doc(courseUser.courseId.path), 'courseId'))
                )
            )
        );

        courses$.subscribe(courses => this.setState({ courses }));
    }

    setMenu = (status: boolean) => {
        this.setState({ showMenu: status });
    }

    setCourses = (status: boolean) => {
        this.setState({ showCourses: status });
    }

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
                            <span><Icon name="edit" /></span>Send Feedback</a>
                        </li>
                    </ul>
                )}
            </div>
        );
    }
}

export default CalendarHeader;
