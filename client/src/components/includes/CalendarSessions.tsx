import * as React from 'react';
import CalendarSessionCard from './CalendarSessionCard';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!) {
    courseByCourseId(courseId: $courseId) {
        sessionSeriesByCourseId {
            nodes {
                sessionSeriesTasBySessionSeriesId{
                    nodes {
                        userByUserId {
                        firstName
                        lastName
                        }
                    }
                }
                sessionsBySessionSeriesId(
                    orderBy: START_TIME_ASC
                    #  condition:  {startTime:  "2018-03-26T10:00:00"}
                )  {
                    nodes {
                        sessionId
                        startTime
                        endTime
                        location
                        sessionTasBySessionId {
                            nodes {
                                userByUserId {
                                    firstName
                                    lastName
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
`;

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ match }) => ({
        variables: { courseId: match.params.courseId }
    })
});

type InputProps = {
    useFakeData: boolean,
    todayEpoch: number,
    match: {
        params: {
            courseId: number,
        },
    },
    data: {
        courseByCourseId?: {
            sessionSeriesByCourseId: {
                nodes: [{}],
            },
            sessionSeriesTasBySessionSeriesId: {
                nodes: [{}],
            },
        },
    },
};

class CalendarSessions extends React.Component<ChildProps<InputProps, Response>> {
    render() {
        // if (process.env.NODE_ENV !== 'production') {
        // For testing purposes only
        // var nowTs = Math.round(Date.now() / 1000);

        var sessions: Session[] = [];
        if (this.props.data.courseByCourseId !== undefined) {
            if (this.props.data.courseByCourseId !== null) {
                this.props.data.courseByCourseId.sessionSeriesByCourseId.nodes.forEach((node: SessionSeriesNode) => {
                    var seriesTas: string[] = [];
                    node.sessionSeriesTasBySessionSeriesId.nodes.forEach((ta: TANode) => {
                        seriesTas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                    });
                    node.sessionsBySessionSeriesId.nodes.forEach((sessionNode: SessionNode) => {
                        var tas: string[] = [];
                        if (sessionNode.sessionTasBySessionId !== undefined) {
                            if (sessionNode.sessionTasBySessionId !== null) {
                                sessionNode.sessionTasBySessionId.nodes.forEach((ta: TANode) => {
                                    tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                                });
                            }
                        }
                        if (tas = []) {
                            tas = seriesTas;
                        }
                        sessions.push({
                            id: sessionNode.sessionId,
                            location: sessionNode.location,
                            ta: tas,
                            startTime: new Date(sessionNode.startTime),
                            endTime: new Date(sessionNode.endTime),
                        });
                    });
                });
            }
        }
        // sessions.sort(function (a: Session, b: Session) {
        //     return (a.startTime > b.startTime) ? -1 : 1;
        // });

        // if (true) {
        //     sessions = [
        //         {
        //             id: 1,
        //             location: 'Gates G21',
        //             ta: ['Corey Valdez'],
        //             startTime: new Date(Date.now() - 30 * 60 * 1000),
        //             endTime: new Date(Date.now() + 30 * 60 * 1000)
        //         }, {
        //             id: 2,
        //             location: 'Academic Surge A Tutoring Office 101',
        //             ta: ['Edgar Stewart'],
        //             startTime: new Date(Date.now()),
        //             endTime: new Date(Date.now() + 60 * 60 * 1000)
        //         }, {
        //             id: 3,
        //             location: 'Academic Surge A Tutoring Office 101',
        //             ta: ['Ada Morton'],
        //             startTime: new Date(Date.now() + 30 * 60 * 1000),
        //             endTime: new Date(Date.now() + 90 * 60 * 1000)
        //         }, {
        //             id: 4,
        //             location: 'Gates G21',
        //             ta: ['Caroline Robinson'],
        //             startTime: new Date(Date.now() + 90 * 60 * 1000),
        //             endTime: new Date(Date.now() + 180 * 60 * 1000)
        //         }
        //     ];
        // }

        return (
            <div className="CalendarSessions">
                {sessions.map(function (session: Session, i: number) {
                    return <CalendarSessionCard
                        start={session.startTime}
                        end={session.endTime}
                        ta={session.ta[0]}
                        location={session.location}
                        resolvedNum={0}
                        aheadNum={0}
                        id={session.id}
                        key={session.id}
                    />;
                })}
            </div>
        );
    }
}

export default withData(CalendarSessions);
