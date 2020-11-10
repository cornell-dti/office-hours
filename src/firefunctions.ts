import type firebase from 'firebase';

import moment from 'moment';
import { useEffect, useState } from 'react';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { importProfessorsOrTAs } from 'lib/admin/import';
import { hasOverlap } from 'utilities/date';
import { collectionData, firestore, auth } from "./firebaseApp";

export const useSessionsAndQuestions = (
    courseId: string,
    startDate: moment.Moment,
    endDate: moment.Moment
): readonly [readonly FireSession[], readonly FireQuestion[][]] => {
    const [sessions, setSessions] = useState<FireSession[]>([]);
    const [questions, setQuestions] = useState<FireQuestion[][]>([]);

    useEffect(() => {
        const sessions$: Observable<FireSession[]> = collectionData(
            firestore
                .collection('sessions')
                .where('startTime', '>=', startDate.toDate())
                .where('startTime', '<=', endDate.add(1, 'day').toDate())
                .where('courseId', '==', courseId),
            'sessionId'
        );
        const s1 = sessions$.subscribe(newSessions => setSessions(newSessions));

        // Fetch all questions for given sessions
        const questions$ = sessions$.pipe(
            switchMap(s =>
                combineLatest(...s.map(session =>
                    collectionData(
                        firestore
                            .collection('questions')
                            .where('sessionId', '==', session.sessionId),
                        'questionId'
                    )
                ))
            )
        );

        const s2 = questions$.subscribe((newQuestions: FireQuestion[][]) => setQuestions(newQuestions));

        return () => {
            s1.unsubscribe();
            s2.unsubscribe();
        };
    });

    return [sessions, questions] as const;
};

export const useSessions = (
    courseId: string,
    startDate: moment.Moment,
    endDate: moment.Moment
): readonly FireSession[] => {
    const [sessions, setSessions] = useState<FireSession[]>([]);

    useEffect(() => {
        if (courseId === '') {
            return () => { };
        }

        const sessions$: Observable<FireSession[]> = collectionData(
            firestore
                .collection('sessions')
                .where('startTime', '>=', startDate.toDate())
                .where('startTime', '<=', endDate.add(1, 'day').toDate())
                .where('courseId', '==', courseId),
            'sessionId'
        ); const sessionStart = startDate.toDate();
        const sessionEnd = endDate.toDate();
        const s1 = sessions$.subscribe(newSessions => setSessions(
            newSessions.filter(s => hasOverlap(
                sessionStart,
                sessionEnd,
                s.startTime.toDate(),
                s.endTime.toDate())
            )
        ));

        return () => {
            s1.unsubscribe();
        };
    }, [courseId, startDate, endDate]);

    return sessions;
};

export const userUpload = (user: firebase.User | null) => {
    if (user != null) {
        const uid = user.uid;
        const email = user.email || 'Dummy Email';
        const displayName = user.displayName || 'Dummy name';
        const photoUrl = user.photoURL || 'Dummy photo';
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
        firestore.runTransaction(async (transaction) => {
            const userDocumentReference = firestore.collection('users').doc(uid);
            const userDocument = await transaction.get(userDocumentReference);
            if (userDocument.exists) {
                const partialUserDocument: Partial<FireUser> = {
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                };
                transaction.update(userDocumentReference, partialUserDocument);
            } else {
                const fullUserDocument: Omit<FireUser, 'userId'> = {
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                    courses: [],
                    roles: {},
                };
                transaction.set(userDocumentReference, fullUserDocument);
            }
            // eslint-disable-next-line no-console
        }).catch(() => console.error('Unable to upload user.'));
    }
};

export const logOut = () => {
    auth
        .signOut()
        .then(() => {
            // Success
        })
        .catch(() => {
            // Fail
        });
};

export const importProfessorsOrTAsFromPrompt = (
    course: FireCourse,
    role: 'professor' | 'ta'
): void => {
    // eslint-disable-next-line no-alert
    const response = prompt(
        `Please enter a comma-separated list of ${role === 'professor' ? role : 'TA'} emails:`
    );
    if (response != null) {
        importProfessorsOrTAs(
            course,
            role,
            response.split(',').map((email) => email.trim())
        );
    }
};
