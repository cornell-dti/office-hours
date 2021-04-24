import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import { of, combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { docData } from 'rxfire/firestore';

import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import ProfessorDelete from '../includes/ProfessorDelete';
import ProfessorSettings from '../includes/ProfessorSettings';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

import {useProfessorViewSessions, useCourse, useMyUser } from '../../firehooks';
import { firestore } from '../../firebase';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

const ProfessorView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const week = new Date();
    week.setHours(0, 0, 0, 0);
    const daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
    week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [selectedWeekEpoch, setSelectedWeekEpoch] = useState(week.getTime());
    const [isSettingsVisible, setSettingsVisible] = useState(false);

    // Add or subtract one week from selectedWeekEpoch
    const handleWeekClick = (previousWeek: boolean) => {
        setSelectedWeekEpoch(old => old + ((previousWeek ? -7 : 7) * ONE_DAY));
    };

    const course = useCourse(courseId);
    const me = useMyUser();

    const [staff, setStaff] = useState<FireUser[]>([]);

    // Keep a list of TAs & Professors to assign to sessions
    useEffect(
        () => {
            const courseStaffIds$: Observable<string[]> = of(course ? [...course.professors, ...course.tas] : []);

            const users$ = courseStaffIds$.pipe<FireUser[]>(switchMap(courseStaffIds =>
                combineLatest(...courseStaffIds.map(courseStaffId =>
                    docData<FireUser>(firestore.doc(`users/${courseStaffId}`), 'userId')
                ))
            ));

            const subscription = users$.subscribe(u => setStaff(u));
            return () => subscription.unsubscribe();
        },
        [course]
    );

    const taOptions: DropdownItemProps[] = [
        { key: 'title', text: 'TA Name' },
        ...(staff.map(user => ({
            key: user.userId,
            text: user.firstName + ' ' + user.lastName,
            value: user.userId
        })))
    ];

    const sessions = useProfessorViewSessions(courseId, selectedWeekEpoch);

    return (
        <div className="ProfessorView">
            <ProfessorSidebar
                courseId={courseId}
                code={course ? course.code : 'Loading'}
                selected={'hours'}
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
                    <button
                        type="button"
                        id="profSettings"
                        onClick={() => setSettingsVisible(visible => !visible)}
                    >
                        <Icon name="setting" />
                        Settings
                    </button>
                    {course && (
                        <ProfessorDelete
                            isDeleteVisible={isSettingsVisible}
                            updateDeleteVisible={() => setSettingsVisible(visible => !visible)}
                            content={
                                <ProfessorSettings
                                    courseId={courseId}
                                    charLimitDefault={course.charLimit}
                                    openIntervalDefault={course.queueOpenInterval}
                                    toggleDelete={() => setSettingsVisible(visible => !visible)}
                                />
                            }
                        />
                    )}
                    <CalendarWeekSelect
                        handleClick={handleWeekClick}
                        selectedWeekEpoch={selectedWeekEpoch}
                    />
                    <div className="Calendar">
                        <ProfessorCalendarTable
                            courseId={courseId}
                            course={course}
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
