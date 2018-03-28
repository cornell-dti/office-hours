import * as React from 'react';
import CalendarSessionCard from './CalendarSessionCard';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!, $beginTime: Datetime!, $endTime: Datetime!) {
    searchSessionRange(course: $courseId, begintime: $beginTime, endtime: $endTime) {
        nodes {
        sessionSeryBySessionSeriesId {
            sessionSeriesTasBySessionSeriesId {
            nodes {
                userByUserId {
                firstName
                lastName
                }
            }
            }
        }
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

`;

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ beginTime, endTime, match }) => ({
        variables: {
            courseId: match.params.courseId,
            beginTime: beginTime,
            endTime: endTime
        }
    })
});

type InputProps = {
    useFakeData: boolean,
    match: {
        params: {
            courseId: number,
        },
    },
    beginTime: Date,
    endTime: Date,
    data: {
        searchSessionRange?: {
            nodes: [{}]
        },
    },
};

class CalendarSessions extends React.Component<ChildProps<InputProps, Response>> {
    render() {
        var sessions: Session[] = [];
        if (this.props.data.searchSessionRange !== undefined) {
            if (this.props.data.searchSessionRange !== null) {
                this.props.data.searchSessionRange.nodes.forEach((node: SessionNode) => {
                    var tas: string[] = [];
                    if (node.sessionTasBySessionId !== undefined) {
                        node.sessionTasBySessionId.nodes.forEach(ta => {
                            tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                        });
                    }
                    if (node.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes !== undefined
                        && tas.length === 0) {
                        node.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes.forEach(ta => {
                            tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                        });
                    }
                    sessions.push({
                        id: node.sessionId,
                        location: node.location,
                        ta: tas,
                        startTime: node.startTime,
                        endTime: node.endTime,
                    });
                });
            }
        }

        if (this.props.useFakeData) {
            sessions = [
                {
                    id: 1,
                    location: 'Gates G21',
                    ta: ['Corey Valdez'],
                    startTime: new Date(Date.now() - 30 * 60 * 1000),
                    endTime: new Date(Date.now() + 30 * 60 * 1000)
                }, {
                    id: 2,
                    location: 'Academic Surge A Tutoring Office 101',
                    ta: ['Edgar Stewart'],
                    startTime: new Date(Date.now()),
                    endTime: new Date(Date.now() + 60 * 60 * 1000)
                }, {
                    id: 3,
                    location: 'Academic Surge A Tutoring Office 101',
                    ta: ['Ada Morton'],
                    startTime: new Date(Date.now() + 30 * 60 * 1000),
                    endTime: new Date(Date.now() + 90 * 60 * 1000)
                }, {
                    id: 4,
                    location: 'Gates G21',
                    ta: ['Caroline Robinson'],
                    startTime: new Date(Date.now() + 90 * 60 * 1000),
                    endTime: new Date(Date.now() + 180 * 60 * 1000)
                }
            ];
        }

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
