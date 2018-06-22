import * as React from 'react';
import CalendarSessionCard from './CalendarSessionCard';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';
import { Loader } from 'semantic-ui-react';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!, $beginTime: Datetime!, $endTime: Datetime!) {
    apiGetSessions(_courseId: $courseId, _beginTime: $beginTime, _endTime: $endTime) {
        nodes {
            sessionSeryBySessionSeriesId {
                building
                room
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
            building
            room
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

const withData = graphql<InputProps, Response>(QUERY, {
    options: ({ beginTime, endTime, courseId }) => ({
        variables: {
            courseId: courseId,
            beginTime: beginTime,
            endTime: endTime
        }
    })
});

type InputProps = {
    activeSessionId: number,
    courseId: number,
    beginTime: Date,
    endTime: Date,
    data: {
        loading: boolean,
        apiGetSessions?: {
            nodes: [{}]
        },
    },
    callback: Function
};

class CalendarSessions extends React.Component<ChildProps<InputProps, Response>> {
    render() {
        const { loading } = this.props.data;

        var sessions: Session[] = [];
        if (this.props.data.apiGetSessions) {
            this.props.data.apiGetSessions.nodes.forEach((node: SessionNode) => {
                var tas: string[] = [];
                if (node.sessionTasBySessionId) {
                    node.sessionTasBySessionId.nodes.forEach(ta => {
                        tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                    });
                }
                var location = '';
                if (node.sessionSeryBySessionSeriesId) {
                    if (node.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes && tas.length === 0) {
                        tas = node.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes.map(
                            ta => ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName
                        );
                    }

                    location = node.sessionSeryBySessionSeriesId.building +
                        ' ' + node.sessionSeryBySessionSeriesId.room;
                }
                if (node.building !== null) {
                    location = node.building + ' ' + node.room;
                }

                sessions.push({
                    id: node.sessionId,
                    location: location,
                    ta: tas,
                    startTime: new Date(node.startTime),
                    endTime: new Date(node.endTime),
                });
            });
            sessions.sort(function (a: Session, b: Session) {
                var x = a.startTime;
                var y = b.startTime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        const callback = this.props.callback;
        const activeSessionId = this.props.activeSessionId;

        return (
            <div className="CalendarSessions">
                {
                    loading &&
                    <Loader active={true} content={'Loading'} />
                }
                {
                    !loading && sessions.length === 0 &&
                    <React.Fragment>
                        <p className="noHoursHeading">No Office Hours</p>
                        <p className="noHoursBody">No office hours are scheduled for today.</p>
                    </React.Fragment>
                }
                {!loading && sessions.map(function (session: Session, i: number) {
                    return <CalendarSessionCard
                        start={session.startTime}
                        end={session.endTime}
                        ta={session.ta[0]}
                        location={session.location}
                        resolvedNum={0}
                        aheadNum={0}
                        id={session.id}
                        key={session.id}
                        callback={callback}
                        active={session.id === activeSessionId}
                    />;
                })}
            </div>
        );
    }
}

export default withData(CalendarSessions);
