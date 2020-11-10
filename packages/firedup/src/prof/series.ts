/* Series Functions */

import Firebase from 'firebase';
import collections from '../collections';
import { Modality } from '../../common';
import { Timestamp } from '../../firebaseApp';
import { datePlus, normalizeDateToDateStart, normalizeDateToWeekStart } from '../../utilities/date';
import { firestore } from '../firebase';
import { getWeekOffsets, OHMutateError } from "../firebasefunctions";

export const createSeries = async (
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const courseDoc = await firestore.collection('courses').doc(sessionSeries.courseId).get();
    const [courseStartWeek, courseEndWeek, courseStartDate, courseEndDate] = (() => {
        const {
            startDate: courseStartFireTimestamp,
            endDate: courseEndFireTimestamp,
        } = courseDoc.data() as FireCourse;
        const rawStart = courseStartFireTimestamp.toDate();
        const rawEnd = courseEndFireTimestamp.toDate();
        return [
            normalizeDateToWeekStart(rawStart),
            normalizeDateToWeekStart(rawEnd),
            normalizeDateToDateStart(rawStart),
            normalizeDateToDateStart(rawEnd),
        ];
    })();
    const [sessionStartOffset, sessionEndOffset] = getWeekOffsets(sessionSeries);
    const now = new Date();
    const currentDate = new Date(courseStartWeek);
    const batch = firestore.batch();
    const sessionSeriesId = firestore.collection('sessions').doc().id;
    while (currentDate <= courseEndWeek) {
        // Create new course only if:
        // - the session is not already the past
        // - the session is after course start date
        // - the session is before (course end date + 1 day)
        const sessionStart = datePlus(currentDate, sessionStartOffset);
        const sessionEnd = datePlus(currentDate, sessionEndOffset);
        if (
            sessionEnd > now &&
            sessionStart >= courseStartDate &&
            sessionStart <= datePlus(courseEndDate, 1000 * 60 * 60 * 24)
        ) {
            if (sessionSeries.modality === 'virtual') {
                const derivedSession: Omit<FireVirtualSession, 'sessionId'> = {
                    modality: sessionSeries.modality,
                    sessionSeriesId,
                    courseId: sessionSeries.courseId,
                    endTime: Firebase.firestore.Timestamp.fromDate(sessionEnd),
                    startTime: Firebase.firestore.Timestamp.fromDate(sessionStart),
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                    totalQuestions: 0,
                    totalResolveTime: 0,
                    totalWaitTime: 0,
                    assignedQuestions: 0,
                    resolvedQuestions: 0
                };

                batch.set(firestore.collection('sessions').doc(), derivedSession);
            } else if (sessionSeries.modality === 'review') {
                const derivedSession: Omit<FireReviewSession, 'sessionId'> = {
                    modality: sessionSeries.modality,
                    sessionSeriesId,
                    courseId: sessionSeries.courseId,
                    endTime: Firebase.firestore.Timestamp.fromDate(sessionEnd),
                    startTime: Firebase.firestore.Timestamp.fromDate(sessionStart),
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                    totalQuestions: 0,
                    totalResolveTime: 0,
                    totalWaitTime: 0,
                    link: '',
                    assignedQuestions: 0,
                    resolvedQuestions: 0
                };

                batch.set(firestore.collection('sessions').doc(), derivedSession);
            } else {
                const derivedSession: Omit<FireInPersonSession | FireHybridSession, 'sessionId'> = {
                    sessionSeriesId,
                    modality: sessionSeries.modality,
                    building: sessionSeries.building,
                    courseId: sessionSeries.courseId,
                    endTime: Firebase.firestore.Timestamp.fromDate(sessionEnd),
                    room: sessionSeries.room,
                    startTime: Firebase.firestore.Timestamp.fromDate(sessionStart),
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                    totalQuestions: 0,
                    totalResolveTime: 0,
                    totalWaitTime: 0,
                    assignedQuestions: 0,
                    resolvedQuestions: 0
                };

                batch.set(firestore.collection('sessions').doc(), derivedSession);
            }
        }
        currentDate.setDate(currentDate.getDate() + 7); // move 1 week forward.
    }
    await batch.commit();
};

export const updateSeries = async (
    sessionSeriesId: string,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const [sessionStartOffset, sessionEndOffset] = getWeekOffsets(sessionSeries);
    const querySnapshot = await firestore
        .collection('sessions')
        .where('sessionSeriesId', '==', sessionSeriesId)
        .get();
    const batch = firestore.batch();
    querySnapshot.forEach((sessionDocument) => {
        const sessionId = sessionDocument.id;
        const oldSession = sessionDocument.data() as Omit<FireSession, 'sessionId'>;
        const startTime = Firebase.firestore.Timestamp.fromDate(
            datePlus(normalizeDateToWeekStart(oldSession.startTime.toDate()), sessionStartOffset)
        );
        const endTime = Firebase.firestore.Timestamp.fromDate(
            datePlus(normalizeDateToWeekStart(oldSession.endTime.toDate()), sessionEndOffset)
        );

        if (sessionSeries.modality === 'virtual' || sessionSeries.modality === 'review') {
            const newSession: Omit<FireVirtualSession | FireReviewSession, 'sessionId'> = {
                sessionSeriesId,
                courseId: sessionSeries.courseId,
                modality: sessionSeries.modality,
                endTime,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                totalResolveTime: 0,
                totalWaitTime: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0
            };
            batch.set(firestore.collection('sessions').doc(sessionId), newSession);
        } else {
            const newSession: Omit<FireHybridSession | FireInPersonSession, 'sessionId'> = {
                sessionSeriesId,
                modality: sessionSeries.modality,
                building: sessionSeries.building,
                courseId: sessionSeries.courseId,
                endTime,
                room: sessionSeries.room,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                totalResolveTime: 0,
                totalWaitTime: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0
            };
            batch.set(firestore.collection('sessions').doc(sessionId), newSession);
        }

    });
    await batch.commit();
};

export const deleteSeries = async (sessionSeriesId: string): Promise<void> => {
    const querySnapshot = await firestore.collection('sessions').where('sessionSeriesId', '==', sessionSeriesId).get();
    const batch = firestore.batch();
    querySnapshot.docs.forEach((document) =>
        batch.delete(firestore.collection('sessions').doc(document.id))
    );
    await batch.commit();
};


/** A do-it-all function that can create/edit sessions/series. */
export const mutateSessionOrSeries = (options: {
    endTime: any;
    isSeriesMutation: boolean;
    locationBuildingSelected?: string;
    locationRoomNumSelected?: string;
    zoomLink: any;
    modality: any;
    courseId: string;
    session: any;
    startTime: any;
    taSelected: { id: string | null }[];
    title?: string;
}): Promise<void> => {
    const { endTime,
        isSeriesMutation,
        locationBuildingSelected,
        locationRoomNumSelected,
        zoomLink,
        modality,
        courseId,
        session,
        startTime,
        taSelected,
        title } = options;
    const startMomentTime = startTime;
    if (startMomentTime === undefined) {
        return Promise.reject(new OHMutateError("No start time selected."));
    }
    const startTimestamp = Timestamp.fromDate(startMomentTime.toDate());
    const endMomentTime = endTime;
    if (endMomentTime === undefined) {
        return Promise.reject(new OHMutateError("No end time selected."));
    }
    const endTimestamp = Timestamp.fromDate(endMomentTime.toDate());

    if (modality === Modality.REVIEW && (!zoomLink ||
        (zoomLink.indexOf('http://') === -1 && zoomLink.indexOf('https://') === -1))) {
        return Promise.reject(new OHMutateError("Not a valid link!"))
    }
    const propsSession = session;
    const taDocuments: string[] = [];
    taSelected.forEach(ta => {
        if (ta && ta.id) {
            taDocuments.push(ta.id);
        }
    });
    if (isSeriesMutation) {
        let series: FireSessionSeriesDefinition;

        if (modality === Modality.VIRTUAL) {
            series = {
                modality,
                courseId,
                endTime: endTimestamp,
                startTime: startTimestamp,
                tas: taDocuments,
                title,
            }
        } else if (modality === Modality.REVIEW) {
            if (zoomLink === undefined) {
                return Promise.reject(new OHMutateError("Not a valid link!"))
            }
            series = {
                modality,
                courseId,
                endTime: endTimestamp,
                startTime: startTimestamp,
                tas: taDocuments,
                title,
                link: zoomLink,
            }
        } else {
            if (modality === Modality.INPERSON) {
                if (!locationBuildingSelected) {
                    return Promise.reject(new OHMutateError("No building provided!"));
                }

                if (!locationRoomNumSelected) {
                    return Promise.reject(new OHMutateError("No room provided!"));
                }
            }

            series = {
                modality,
                courseId,
                endTime: endTimestamp,
                startTime: startTimestamp,
                tas: taDocuments,
                title,
                building: locationBuildingSelected || '',
                room: locationRoomNumSelected || '',
            };
        }

        if (propsSession) {
            const seriesId = propsSession.sessionSeriesId;
            if (seriesId === undefined) {
                return Promise.reject(
                    new OHMutateError(
                        "This is not a repeating office hour, deselect 'Edit all office hours in this series'."
                    )
                );
            }
            return updateSeries(seriesId, series);
        }

        return createSeries(series);
    }

    const sessionSeriesId = propsSession && propsSession.sessionSeriesId;

    const sessionLocation = modality === Modality.HYBRID || modality === Modality.INPERSON ? {
        building: locationBuildingSelected || '',
        room: locationRoomNumSelected || '',
    } : {};
    const sessionLink = modality === Modality.REVIEW ? {
        link: zoomLink || '',
    } : {};
    const sessionWithoutSessionSeriesId = {
        modality,
        courseId,
        endTime: endTimestamp,
        startTime: startTimestamp,
        tas: taDocuments,
        totalQuestions: 0,
        assignedQuestions: 0,
        resolvedQuestions: 0,
        totalWaitTime: 0,
        totalResolveTime: 0,
        title,
        ...sessionLocation,
        ...sessionLink
    };
    const newSession: Omit<FireSession, 'sessionId'> = sessionSeriesId === undefined
        ? sessionWithoutSessionSeriesId
        : { ...sessionWithoutSessionSeriesId, ...sessionLocation, ...sessionLink, sessionSeriesId };
    if (propsSession) {
        return collections.sessions().doc(propsSession.sessionId).update(newSession);
    }

    return collections.sessions().add(newSession).then(() => { });
};