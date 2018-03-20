import * as React from 'react';
import CalendarSessionCard from './CalendarSessionCard';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
    query FindSessionsByCourse($courseId: Int!) {
        courseByCourseId(courseId: $courseId) {
            sessionsByCourseId {
                nodes {
                    sessionId
                    startTime
                    endTime
                    location
                    sessionTasBySessionId {
                        nodes {
                            ta
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
    todayEpoch: number,
    match: {
        params: {
            courseId: number,
        },
    },
    data: {
        courseByCourseId?: {
            sessionsByCourseId: {
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
                this.props.data.courseByCourseId.sessionsByCourseId.nodes.forEach((node: SessionNode) => {
                    var tas: string[] = [];
                    if (node.sessionTasBySessionId !== undefined) {
                        if (node.sessionTasBySessionId !== null) {
                            node.sessionTasBySessionId.nodes.forEach((ta: TANode) => {
                                tas.push(ta.ta);
                            });
                        }
                    }
                    sessions.push({
                        id: node.sessionId,
                        location: node.location,
                        ta: tas,
                        startTime: new Date(node.startTime),
                        endTime: new Date(node.endTime),
                    });
                });
            }
        }
        sessions.sort(function (a: Session, b: Session) {
            return (a.startTime > b.startTime) ? -1 : 1;
        });

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
