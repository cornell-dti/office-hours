import {randArr, randInt, randModality, randStr, timeToFireTimestamp} from "../utils/utils";
import moment from "moment-timezone";

// Use these functions to get a dummy session for tests

const getDummyFireBaseSession = (
    courseId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
    sessionId: string = randStr(15),
    sessionSeriesId: string = randStr(15)
) : FireBaseSession => {
    return {
        assignedQuestions: 0,
        courseId,
        endTime,
        modality: 'hybrid',
        resolvedQuestions: 0,
        sessionId,
        sessionSeriesId,
        startTime,
        tas: ["Guan"],
        title: randStr(15),
        totalQuestions: 0,
        totalResolveTime: 0,
        totalWaitTime: 0
    }
}

export const getDummyFireVirtualSession = (
    courseId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
    sessionId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
): FireVirtualSession => {
    const underlyingSession = getDummyFireBaseSession(
        courseId,
        startTime,
        endTime,
        sessionId,
        sessionSeriesId
    );
    return {
        ...underlyingSession,
        modality: 'virtual'
    };
}

export const getDummyFireInPersonSession = (
    courseId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
    sessionId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
): FireInPersonSession => {
    const underlyingSession = getDummyFireBaseSession(
        courseId,
        startTime,
        endTime,
        sessionId,
        sessionSeriesId
    );
    return {
        ...underlyingSession,
        modality: 'in-person',
        building: randArr(['Gates Hall', 'Carpenter Hall', 'Hollister Hall', 'Rhodes Hall']),
        room: `Room ${randInt(1, 8) * 100 + randInt(0, 30)}`
    };
}

export const getDummyFireHybridSession = (
    courseId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
    sessionId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
): FireHybridSession => {
    const underlyingSession = getDummyFireInPersonSession(
        courseId,
        startTime,
        endTime,
        sessionId,
        sessionSeriesId,
    );
    return {
        ...underlyingSession,
        modality: 'hybrid'
    };
}

export const getDummyFireReviewSession = (
    courseId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
    sessionId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
): FireReviewSession => {
    const underlyingSession = getDummyFireInPersonSession(
        courseId,
        startTime,
        endTime,
        sessionId,
        sessionSeriesId,
    );
    return {
        ...underlyingSession,
        modality: 'review',
        link: `http://www.google.com/${randStr(15)}`
    };
}

export const getDummyFireSession = (
    courseId: string = randStr(15),
    startTime: FireTimestamp = timeToFireTimestamp(moment().subtract(1, 'hour').unix()),
    endTime: FireTimestamp = timeToFireTimestamp(moment().add(1, 'hour').unix()),
    sessionId: string = randStr(15),
    sessionSeriesId: string = randStr(15),
) : FireSession => {
    const rand = randInt(0, 4);
    if (rand === 0){
        return getDummyFireVirtualSession(courseId, startTime, endTime, sessionId, sessionSeriesId);
    } else if (rand === 1){
        return getDummyFireInPersonSession(courseId, startTime, endTime, sessionId, sessionSeriesId);
    } else if (rand === 2){
        return getDummyFireHybridSession(courseId, startTime, endTime, sessionId, sessionSeriesId);
    }
    return getDummyFireReviewSession(courseId, startTime, endTime, sessionId, sessionSeriesId);
}
