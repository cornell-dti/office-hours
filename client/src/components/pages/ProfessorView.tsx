import * as React from 'react';
import { useState, useEffect } from 'react';

import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';
import { DropdownItemProps } from 'semantic-ui-react';

import { useCourse, useMyUser } from 'src/firehooks';
import { firestore, collectionData } from 'src/firebase';
import { combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { docData } from 'rxfire/firestore';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

const ProfessorView = (props: {
    match: {
        params: {
            courseId: string;
        }
    }
}) => {
    // RYAN_TODO Simplify.
    let week = new Date();
    week.setHours(0, 0, 0, 0);
    let daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
    week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const [selectedWeekEpoch, setSelectedWeekEpoch] = useState(week.getTime());

    // Add or subtract one week from selectedWeekEpoch
    const handleWeekClick = (previousWeek: boolean) => {
        setSelectedWeekEpoch(old => old + ((previousWeek ? -7 : 7) * ONE_DAY));
    };

    const courseId = props.match.params.courseId;
    const course = useCourse(courseId);
    const me = useMyUser();

    const [staff, setStaff] = useState<FireUser[]>([]);
    const [sessions, setSessions] = useState<FireSession[]>([]);

    // Keep a list of TAs & Professors to assign to sessions
    useEffect(
        () => {
            const courseUsers$ = collectionData(
                firestore
                    .collection('courseUsers')
                    .where('courseId', '==', firestore.doc('courses/' + courseId))
                    .where('role', 'in', ['professor', 'ta']),
                'courseUserId'
            );

            const users$ = courseUsers$.pipe(switchMap(courseUsers =>
                combineLatest(...courseUsers.map((courseUser: FireCourseUser) =>
                    docData<FireUser>(firestore.doc(courseUser.userId.path), 'userId').pipe(
                        map(u => ({ ...u, role: courseUser.role }))
                    )
                ))
            ));

            const subscription = users$.subscribe(u => setStaff(u));
            return () => subscription.unsubscribe();
        },
        [courseId]
    );

    const taOptions: DropdownItemProps[] = [
        { key: 'title', text: 'TA Name' },
        ...(staff.map(user => ({
            key: user.userId,
            text: user.firstName + ' ' + user.lastName,
            value: user.userId
        })))
    ];

    useEffect(
        () => {
            const sessions$ = collectionData(
                firestore
                    .collection('sessions')
                    .where('courseId', '==', firestore.doc('courses/' + courseId))
                    .where('startTime', '>=', new Date(selectedWeekEpoch))
                    .where('startTime', '<=', new Date(selectedWeekEpoch + 7 * ONE_DAY)),
                'sessionId'
            );

            const subscription = sessions$.subscribe((s: FireSession[]) => setSessions(s));
            return () => subscription.unsubscribe();
        },
        [courseId, selectedWeekEpoch]
    );

    return (
        <div className="ProfessorView">
            <ProfessorSidebar
                courseId={courseId}
                code={course ? course.code : 'Loading'}
                selected={0}
            />
            <TopBar
                courseId={courseId}
                user={me}
                context="professor"
                role="professor"
            />
            <section className="rightOfSidebar">
                <div className="main">
                    <ProfessorAddNew
                        courseId={courseId}
                        taOptions={taOptions}
                    />
                    <CalendarWeekSelect
                        handleClick={handleWeekClick}
                        selectedWeekEpoch={selectedWeekEpoch}
                    />
                    <div className="Calendar">
                        <ProfessorCalendarTable
                            courseId={courseId}
                            sessions={sessions}
                            taOptions={taOptions}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfessorView;
