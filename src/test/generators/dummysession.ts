import {randArr, randInt, randModality, randStr, timeToFireTimestamp} from "../utils/utils";
import moment from "moment-timezone";

// Use these functions to get a dummy session for tests

const getDummyBaseSession = (
    courseId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
) : FireBaseSession => {
    return {
        assignedQuestions: 0,
        courseId,
        endTime,
        modality: 'hybrid',
        resolvedQuestions: 0,
        sessionId: randStr(15),
        sessionSeriesId,
        startTime,
        tas: [],
        title: randStr(15),
        totalQuestions: 0,
        totalResolveTime: 0,
        totalWaitTime: 0
    }
}

export const getDummyVirtualSession = (
    courseId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
): FireVirtualSession => {
    const underlyingSession = getDummyBaseSession(
        courseId,
        sessionSeriesId,
        startTime,
        endTime,
    );
    return {
        ...underlyingSession,
        modality: 'virtual'
    };
}

export const getDummyInPersonSession = (
    courseId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
): FireInPersonSession => {
    const underlyingSession = getDummyBaseSession(
        courseId,
        sessionSeriesId,
        startTime,
        endTime
    );
    return {
        ...underlyingSession,
        modality: 'in-person',
        building: randArr(['Gates Hall', 'Carpenter Hall', 'Hollister Hall', 'Rhodes Hall']),
        room: `Room ${randInt(1, 8) * 100 + randInt(0, 30)}`
    };
}

export const getDummyHybridSession = (
    courseId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
): FireHybridSession => {
    const underlyingSession = getDummyInPersonSession(
        courseId,
        sessionSeriesId,
        startTime,
        endTime
    );
    return {
        ...underlyingSession,
        modality: 'hybrid'
    };
}

export const getDummyReviewSession = (
    courseId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
): FireReviewSession => {
    const underlyingSession = getDummyInPersonSession(
        courseId,
        sessionSeriesId,
        startTime,
        endTime
    );
    return {
        ...underlyingSession,
        modality: 'review',
        link: `http://www.google.com/${randStr(15)}`
    };
}

const getSession = (
    type: number,
    courseId: string,
    sessionSeriesId: string,
    startTime: FireTimestamp,
    endTime: FireTimestamp
) : FireSession => {
    if (type === 0){
        return getDummyVirtualSession(courseId, sessionSeriesId, startTime, endTime);
    } else if (type === 1){
        return getDummyInPersonSession(courseId, sessionSeriesId, startTime, endTime);
    } else if (type === 2){
        return getDummyHybridSession(courseId, sessionSeriesId, startTime, endTime);
    }
    return getDummyReviewSession(courseId, sessionSeriesId, startTime, endTime);
}

export const getDummySession = (
    courseId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix())
) : FireSession => {
    const rand = randInt(0, 4);
    return getSession(rand, courseId, sessionSeriesId, startTime, endTime);
}

export const getDummySessionSeries = (
    courseId: string = randStr(15),
    numSessions: number = 5,
    startTime: moment.Moment = moment().subtract(randInt(0, 720), 'minutes'),
    endTime: moment.Moment = moment(startTime).add(randInt(60, 300), 'minutes')
) : FireSession[] => {
    // Standardize to a particular type
    const sessionSeriesId = randStr(15);
    const rand = randInt(0, 4);
    const result: FireSession[] = [];
    let currStartTime = moment(startTime);
    let currEndTime = moment(endTime);
    for (let i = 0; i < numSessions; i++){
        currStartTime = currStartTime.add(1, 'week');
        currEndTime = currEndTime.add(1, 'week');
        result.push(getSession(
            rand,
            courseId,
            sessionSeriesId,
            timeToFireTimestamp(currStartTime.unix()),
            timeToFireTimestamp(currEndTime.unix())
        ));
    }
    return result;
}
