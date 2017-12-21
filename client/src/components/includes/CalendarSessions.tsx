import * as React from 'react';
import '../../styles/CalendarSessions.css';
import CalendarSessionCard from './CalendarSessionCard';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';

class CalendarSessions extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        if (this.props.data.loading) {
            return <div>Loading</div>; // TODO handle
        }
        if (this.props.data.error) {
            return <div>Error</div>; // TODO handle
        }
        const sessionList: Session[] = this.props.data.course.sessions;
        const sessionCardElements = [];
        for (var i = 0; i < sessionList.length; i++) {
            const iSession = sessionList[i];
            const taNames = iSession.tas.map((ta) => (ta.name));
            sessionCardElements.push(
                <CalendarSessionCard
                    start={iSession.start}
                    end={iSession.end}
                    ta={taNames.join(', ')}
                    location={iSession.location}
                    resolvedNum={5}
                    aheadNum={23}
                />
            );
        }
        return (
            <div className="CalendarSessions">
                {sessionCardElements}
            </div>
        );
    }
}

const QUERY = gql`query getCourseSessions($course: String!){
    course(name:$course){
      sessions {
        id
        start
        end
        location
        tas {
          name
        }
      }
    }
  }`;

type Session = {
    id: string,
    start: number,
    end: number,
    location: string,
    tas: [{
        name: string
    }]
};

type Response = {
    course: {
        sessions: Session[]
    }
};

type InputProps = {
    currentCourse: string
};

const finalQuery = graphql<Response, InputProps>(QUERY, {
    options: ({ currentCourse }) => ({ variables: { course: currentCourse } }),
});

export default finalQuery(CalendarSessions);