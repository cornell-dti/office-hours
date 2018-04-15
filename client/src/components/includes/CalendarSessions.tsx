import * as React from 'react';
import CalendarSessionCard from './CalendarSessionCard';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader/Loader';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!, $beginTime: Datetime!, $endTime: Datetime!) {
    searchSessionRange(course: $courseId, begintime: $beginTime, endtime: $endTime) {
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
    match: {
        params: {
            courseId: number,
        },
    },
    beginTime: Date,
    endTime: Date,
    data: {
        loading: boolean,
        searchSessionRange?: {
            nodes: [{}]
        },
    },
};

class CalendarSessions extends React.Component<ChildProps<InputProps, Response>> {
    render() {
        const { loading } = this.props.data;

        var sessions: Session[] = [];
        if (this.props.data.searchSessionRange) {
            this.props.data.searchSessionRange.nodes.forEach((node: SessionNode) => {
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
        }

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
                    />;
                })}
            </div>
        );
    }
}

export default withData(CalendarSessions);
