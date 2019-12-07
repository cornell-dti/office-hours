import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';
import { DropdownItemProps } from 'semantic-ui-react';
import 'moment-timezone';
import { useState } from 'react';
import { useCourse, useMyUser } from 'src/firehooks';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

// const SESSIONS_QUERY = gql`
// query FindSessionsByCourse($courseId: Int!, $beginTime: Datetime!, $endTime: Datetime!) {
//     apiGetSessions(_courseId: $courseId, _beginTime: $beginTime, _endTime: $endTime) {
//         nodes {
//             sessionId
//             startTime
//             endTime
//             building
//             room
//             sessionSeriesId
//             title
//             sessionTasBySessionId {
//                 nodes {
//                     userByUserId {
//                         computedName
//                         userId
//                     }
//                 }
//             }
//         }
//     }
//     courseByCourseId(courseId: $courseId) {
//         tas: courseUsersByCourseId(condition: {role: "ta"}) {
//             nodes {
//                 userByUserId {
//                     computedName
//                     userId
//                 }
//             }
//         }
//         professors: courseUsersByCourseId(condition: {role: "professor"}) {
//             nodes {
//                 userByUserId {
//                     computedName
//                     userId
//                 }
//             }
//         }
//     }
// }
// `;

const ProfessorView = (props: {
    match: {
        params: {
            courseId: string;
        }
    }
}) => {
    // TODO Simplify.
    let week = new Date();
    week.setHours(0, 0, 0, 0);
    let daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
    week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const [selectedWeekEpoch, setSelectedWeekEpoch] = useState(week.getTime());

    // Add or subtract one week from selectedWeekEpoch
    const handleWeekClick = (previousWeek: boolean) => {
        setSelectedWeekEpoch(old => old + ((previousWeek ? 7 : -7) * ONE_DAY));
    };

    {/*
        var taOptions: DropdownItemProps[] = [{ key: -1, text: 'TA Name' }];
        if (!loading && data) {
            data.courseByCourseId.tas.nodes.forEach((node) => {
                taOptions.push({
                    value: node.userByUserId.userId,
                    text: node.userByUserId.computedName
                });
            });
            data.courseByCourseId.professors.nodes.forEach((node) => {
                taOptions.push({
                    value: node.userByUserId.userId,
                    text: node.userByUserId.computedName
                });
            });
        }
    */}

    const courseId = props.match.params.courseId;
    const course = useCourse(courseId);
    const me = useMyUser();
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
                            data={data.apiGetSessions}
                            taOptions={taOptions}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfessorView;
