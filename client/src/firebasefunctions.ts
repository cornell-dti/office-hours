/* eslint-disable @typescript-eslint/indent */

import { firestore, auth } from 'firebase/app';
import { datePlus, normalizeDateToDateStart, normalizeDateToWeekStart } from './utilities/date';

export const userUpload = (user: firebase.User | null, db: firebase.firestore.Firestore) => {
  if (user != null) {
    const uid = user.uid;
    const email = user.email || 'Dummy Display Name';
    const displayName = user.displayName || 'Dummy Email';
    const photoUrl = user.photoURL || 'Dummy Display Name';
    const metaData = user.metadata;
    const createdAt = firestore.Timestamp.fromDate(
      metaData.creationTime ? new Date(metaData.creationTime) : new Date());
    let stringSplit = -1;
    let firstName = displayName;
    let lastName = '';
    if (displayName != null) {
      stringSplit = displayName.indexOf(' ');
      if (stringSplit !== -1) {
        firstName = displayName.substring(0, stringSplit);
        lastName = displayName.substring(stringSplit + 1);
      }
    }
    const lastActivityAt = firestore.FieldValue.serverTimestamp() as unknown as FireTimestamp;
    db.runTransaction(async (transaction) => {
      const userDocumentReference = db.collection('users').doc(uid);
      const userDocument = await transaction.get(userDocumentReference);
      if (userDocument.exists) {
        const partialUserDocument: Partial<FireUser> = {
          email,
          firstName,
          lastName,
          photoUrl,
          createdAt,
          lastActivityAt
        };
        transaction.update(userDocumentReference, partialUserDocument);
      } else {
        const fullUserDocument: Omit<FireUser, 'userId'> = {
          email,
          firstName,
          lastName,
          photoUrl,
          createdAt,
          lastActivityAt,
          courses: [],
          roles: {}
        };
        transaction.set(userDocumentReference, fullUserDocument);
      }
    // eslint-disable-next-line no-console
    }).catch(() => console.error('Unable to upload user.'));
  }
};

const getWeekOffsets = (sessionSeries: Omit<FireSessionSeries, 'sessionSeriesId'>): [number, number] => {
  const { startTime: seriesStartFireTimestamp, endTime: seriesEndFireTimestamp } = sessionSeries;
  const rawStart = seriesStartFireTimestamp.toDate();
  const rawEnd = seriesEndFireTimestamp.toDate();
  return [
    rawStart.getTime() - normalizeDateToWeekStart(rawStart).getTime(),
    rawEnd.getTime() - normalizeDateToWeekStart(rawEnd).getTime(),
  ];
};

export const createSeries = async (
  db: firebase.firestore.Firestore,
  sessionSeries: Omit<FireSessionSeries, 'sessionSeriesId'>
): Promise<void> => {
  const courseDoc = await db.collection('courses').doc(sessionSeries.courseId).get();
  const [courseStartWeek, courseEndWeek, courseStartDate, courseEndDate] = (() => {
    const { startDate: courseStartFireTimestamp, endDate: courseEndFireTimestamp } = courseDoc.data() as FireCourse;
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
  const batch = db.batch();
  const sessionSeriesId = db.collection('sessions').doc().id;
  while (currentDate <= courseEndWeek) {
    // Create new course only if:
    // - the session is not already the past
    // - the session is after course start date
    // - the session is before (course end date + 1 day)
    const sessionStart = datePlus(currentDate, sessionStartOffset);
    const sessionEnd = datePlus(currentDate, sessionEndOffset);
    if (sessionEnd > now
      && sessionStart >= courseStartDate
      && sessionStart <= datePlus(courseEndDate, 1000 * 60 * 60 * 24)
    ) {
      const derivedSession: Omit<FireSession, 'sessionId'> = {
        sessionSeriesId,
        building: sessionSeries.building,
        courseId: sessionSeries.courseId,
        endTime: firestore.Timestamp.fromDate(sessionEnd),
        room: sessionSeries.room,
        startTime: firestore.Timestamp.fromDate(sessionStart),
        tas: sessionSeries.tas,
        title: sessionSeries.title
      };
      batch.set(db.collection('sessions').doc(), derivedSession);
    }
    currentDate.setDate(currentDate.getDate() + 7); // move 1 week forward.
  }
  await batch.commit();
};

export const updateSeries = async (
  db: firebase.firestore.Firestore,
  sessionSeriesId: string,
  sessionSeries: Omit<FireSessionSeries, 'sessionSeriesId'>
): Promise<void> => {
  const [sessionStartOffset, sessionEndOffset] = getWeekOffsets(sessionSeries);
  const querySnapshot = await db.collection('sessions').where('sessionSeriesId', '==', sessionSeriesId).get();
  const batch = db.batch();
  querySnapshot.forEach(sessionDocument => {
    const sessionId = sessionDocument.id;
    const oldSession = sessionDocument.data() as Omit<FireSession, 'sessionId'>;
    const startTime = firestore.Timestamp.fromDate(
      datePlus(normalizeDateToWeekStart(oldSession.startTime.toDate()), sessionStartOffset)
    );
    const endTime = firestore.Timestamp.fromDate(
      datePlus(normalizeDateToWeekStart(oldSession.endTime.toDate()), sessionEndOffset)
    );
    const newSession: Omit<FireSession, 'sessionId'> = {
      sessionSeriesId,
      building: sessionSeries.building,
      courseId: sessionSeries.courseId,
      endTime,
      room: sessionSeries.room,
      startTime,
      tas: sessionSeries.tas,
      title: sessionSeries.title
    };
    batch.set(db.collection('sessions').doc(sessionId), newSession);
  });
  await batch.commit();
};

export const deleteSeries = async (db: firebase.firestore.Firestore, sessionSeriesId: string): Promise<void> => {
  const querySnapshot = await db.collection('sessions').where('sessionSeriesId', '==', sessionSeriesId).get();
  const batch = db.batch();
  querySnapshot.docs.forEach(document => batch.delete(db.collection('sessions').doc(document.id)));
  await batch.commit();
};

export const logOut = () => {
  auth().signOut().then(() => {
    // Success
  }).catch(error => {
    // Fail
  });
};
