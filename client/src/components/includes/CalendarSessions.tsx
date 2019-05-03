import * as React from 'react';
// import { useState } from 'react';
import { Loader } from 'semantic-ui-react';
import { groupBy } from 'lodash';
// import { useFirestoreDoc } from '../../firestoreHooks';

import CalendarSessionCard from './CalendarSessionCard';
// import { firestore } from './firebase';

const labelSession = (session: FireSession, interval: number) => {
    if (new Date(session.endTime.seconds) < new Date()) {
        return 'Past';
    } else if (new Date(session.startTime.seconds) < new Date()) {
        return 'Ongoing';
    } else if (new Date(session.startTime.seconds) < new Date(new Date().getTime() + interval)) {
        return 'Open';
    }
    return 'Upcoming';
};

// let useMyQuestions = (userId: string) => {
//     let [myQuestions, setMyQuestions] = useState(undefined);
//     firestore
//         .collection("questions")
//         .where("userId", "==", userId)
//         .where("status", "==", "unresolved")
//         .onSnapshot((snapshot) => {
//             // @ts-ignore - TS Doesn't know what to expect from Firebase
//             setMyQuestions(snapshot.docs.map((d) => {
//                 return { 'id': d.id, ...d.data() }
//             }));
//         });
//     return myQuestions;
// };

const CalendarSessions = (props: {
    activeSessionId: string;
    userId: string | null;
    loading: boolean;
    sessions: FireSession[];
    callback: Function;
    interval: number;
}) => {
    const { loading, sessions } = props;
    // const myQuestions = props.userId ? useMyQuestions(props.userId) : [];
    const sessionCards = sessions && sessions.map(session => {
        // const unresolvedQuestions = 0;
        // session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved');
        const userQuestions = []; // unresolvedQuestions.filter((q) => q.userByAskerId.userId === this.props.myUserId);

        const numAhead = 0;
        // userQuestions.length === 0 ? unresolvedQuestions.length : unresolvedQuestions.filter((q) =>
        // q.timeEntered <= userQuestions[0].timeEntered).length - 1;

        return (
            <CalendarSessionCard
                includeBookmark={userQuestions.length > 0}
                numAhead={numAhead}
                session={session}
                key={session.id}
                callback={props.callback}
                active={session.id === props.activeSessionId}
                status={labelSession(session, props.interval)}
            />
        );
    });
    const groupedCards = sessionCards && groupBy(sessionCards, (card) => card.props.status);
    return (
        <div className="CalendarSessions">
            {loading && <Loader active content="Loading" />}
            {!loading && sessions && sessions.length === 0 && (
                <React.Fragment>
                    <p className="noHoursHeading">No Office Hours</p>
                    <p className="noHoursBody">No office hours are scheduled for today.</p>
                </React.Fragment>)}
            {groupedCards && (
                <React.Fragment>
                    {'Past' in groupedCards && (
                        <React.Fragment>
                            <h6>Past</h6>
                            {groupedCards.Past}
                        </React.Fragment>)}
                    {'Open' in groupedCards && (
                        <React.Fragment>
                            <h6>Open</h6>
                            {groupedCards.Open}
                        </React.Fragment>)}
                    {'Ongoing' in groupedCards && (
                        <React.Fragment>
                            <h6>Ongoing</h6>
                            {groupedCards.Ongoing}
                        </React.Fragment>)}
                    {'Upcoming' in groupedCards && (
                        <React.Fragment>
                            <h6>Upcoming</h6>
                            {groupedCards.Upcoming}
                        </React.Fragment>
                    )}
                </React.Fragment>
            )}
        </div>
    );
};

export default CalendarSessions;
