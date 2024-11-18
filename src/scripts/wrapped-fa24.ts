import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');

// Initialize Firestore
const db = admin.firestore();
const errorUsers: {
    user: string,
    error: string
}[] = [];

// Firestore Timestamps for the query range

const startDate = admin.firestore.Timestamp.fromDate(new Date('2024-01-22'));
const endDate = admin.firestore.Timestamp.fromDate(new Date('2024-11-22'));

const getWrapped = async () => {
    // Refs
    const questionsRef = db.collection('questions');
    const sessionsRef = db.collection('sessions');
    const wrappedRef = db.collection('wrapped-fa24');
    const usersRef = db.collection('users');

    // Query all questions asked between FA23 and SP24
    const questionsSnapshot = await questionsRef
        .where('timeEntered', '>=', startDate) 
        .where('timeEntered', '<=', endDate)
        .get();

    const userStats: { [userId: string]: {
        numVisits: number;
        favClass: string;
        favTaId: string;
        favMonth: number;
        favDay: number;
        totalMinutes: number;
        personalityType: string;
        timeHelpingStudents?: number;
        numStudentsHelped?: number;
    }} = {};

    const getWrappedUserDocs = async () => {
        const docs: {[userId:string]: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} = {};
        await Promise.all(Object.keys(userStats).map(async (id) => {
            if (id){
                docs[id] = await usersRef.doc(id).get();
            }
        }
        ));
        return docs;
    }

    const getWrappedSessionDocs = async () => {
        const docs: {[sessionId:string]: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>} = {};
        const sessionIds: string[] = [];
        questionsSnapshot.docs.map((doc) => sessionIds.push(doc.get('sessionId')));
        sessionIds.sort();
        // eslint-disable-next-line no-console
        // console.log(sessionIds);
        await Promise.all(sessionIds.map(async (id) => {
            if (id) {
                docs[id] = await sessionsRef.doc(id).get();
            }
        }
        ));
        return docs;
    }

    const taCounts: {[userId: string] : Map<string, number>} = {};
    const monthTimeCounts: {[userId: string]: number[]} = {};
    const officeHourSessions: { [userId: string]: string[]} = {};
    // Every taID has an array of objects, where the objects store a sessionId and askerId
    const TAsessions: {[taID:string]: {
        session: string; 
        asker: string;
        courseId: string;
        day: number;
    }[]} = {};

    // Helper functions
    const updateWrappedDocs = async () => {
        // Update the wrapped collection
        const batch = db.batch();
        const userDocuments = await getWrappedUserDocs();
        for (const [userId, stats] of Object.entries(userStats)) {
            // Only want to make wrapped changes for a user if they have an ID and are active 
            if (userId) {
                /* Defition of active: 
            If a user is only a student, they need to have at least one OH visit. 
            If a user is a TA, they need to have at least one TA session AND at least one OH visit as a student.
        */
                const hasVisits = stats.numVisits > 0;
                // This is true if the user is either a student, or a TA who has more than one session
                const isUserActive = stats.timeHelpingStudents === undefined || (TAsessions[userId]?.length > 0);
                // True if user is either a student, or TA who helped more than 0 students for more than 0 minutes
                const taHelped = stats.timeHelpingStudents === undefined || 
                (stats.numStudentsHelped && stats.timeHelpingStudents > 0 && stats.numStudentsHelped > 0);
                const hasFavoriteTa = stats.favTaId !== "";
                const taStatsMismatched = 
                (stats.timeHelpingStudents !== undefined && stats.numStudentsHelped === undefined)
                || (stats.timeHelpingStudents === undefined && stats.numStudentsHelped !== undefined);
                if (hasVisits && isUserActive && hasFavoriteTa && taHelped) {
                    if (!(stats.favClass && stats.favDay !== -1 && stats.favMonth !== -1)) {
                        errorUsers.push({user: userId, 
                            error: `User is active and has favorite TA but missing one of the following:
                             favClass: ${stats.favClass}, favDay: ${stats.favDay}, favMonth: ${stats.favMonth}`});
                    } else if (taStatsMismatched) {
                        errorUsers.push({user: userId, error: "Mismatch in updating ta specfic values."})
                    } else {
                        const wrappedDocRef = wrappedRef.doc(userId);
                        batch.set(wrappedDocRef, stats);
        
                        const userDoc = userDocuments[userId];
                        if (userDoc.exists) {
                            usersRef.doc(userId).update({
                                wrapped: true,
                            });
                        } else {
                            // Handle the case where the document does not exist
                            errorUsers.push({user: userId, 
                                error: "No document found for this user, skipping update."});
                        }
                    }
                } else {
                    errorUsers.push({user: userId, 
                        error: "User is not an active student/TA or doesn't have favorite TA."});
                }
            } else {
                errorUsers.push({user: userId, error: "User ID is undefined, skipping update."});
            }
        }
    
        await batch.commit();
    }

    const initializeUser = (answererId:string, askerId:string) => {
        // if an instance doesn't exist yet for the user, creating one
        if (!userStats[askerId]) {
            userStats[askerId] = {
                numVisits: 0,
                favClass: '',
                favTaId: '',
                favMonth: -1,
                favDay: -1,
                totalMinutes: 0,
                personalityType: '',
            };

            taCounts[askerId] = new Map<string, number>();
            officeHourSessions[askerId] = [];
            monthTimeCounts[askerId] = [0,0,0,0,0,0,0,0,0,0,0,0];
        } 

        if (!userStats[answererId]) {
            userStats[answererId] = {
                numVisits: 0,
                favClass: '',
                favTaId: '',
                favMonth: -1,
                favDay: -1,
                totalMinutes: 0,
                personalityType: '',
                timeHelpingStudents: 0,
                numStudentsHelped: 0
            };

            taCounts[answererId] = new Map<string, number>();
            officeHourSessions[answererId] = [];
            TAsessions[answererId] = [];
            monthTimeCounts[answererId] = [0,0,0,0,0,0,0,0,0,0,0,0];
            // Checking if ta already showed up as student and now as an answerer
        } else if (userStats[answererId] && userStats[answererId]?.timeHelpingStudents === undefined) {
            userStats[answererId] = {
                numVisits: userStats[answererId].numVisits,
                favClass: userStats[answererId].favClass,
                favTaId: userStats[answererId].favTaId,
                favMonth: userStats[answererId].favMonth,
                favDay: userStats[answererId].favDay,
                totalMinutes: userStats[answererId].totalMinutes,
                personalityType: userStats[answererId].personalityType,
                timeHelpingStudents: 0,
                numStudentsHelped: 0
            };
            TAsessions[answererId] = [];
        }

    }

     
    const processStats = () => {
        count = 0;
        for (const [userId, stats] of Object.entries(userStats)) {
            if (count > 0 && count % 100 === 0) {
            // eslint-disable-next-line no-console
                console.log(`${count}/${Object.entries(userStats).length} users processed.`);
            }
            stats.numVisits = officeHourSessions[userId].length;
            stats.totalMinutes = Math.ceil(stats.totalMinutes);
            if (stats.timeHelpingStudents !== undefined) {
                stats.timeHelpingStudents = Math.ceil(stats.timeHelpingStudents);
                if (stats.numStudentsHelped !== undefined) {
                    stats.numStudentsHelped = TAsessions[userId].length;
                } 
            }
            // Personality type
            const weeksInRange = (endDate.toDate().getTime() - startDate.toDate().getTime())
        / (1000 * 60 * 60 * 24 * 7); // convert ms to weeks
            const averageSessionsPerWeek = stats.numVisits / weeksInRange;

            if (averageSessionsPerWeek >= 2) {
                stats.personalityType = 'Consistent';
            } else if (averageSessionsPerWeek >= 0.5) {
                stats.personalityType = 'Resourceful';
            } else {
                stats.personalityType = 'Independent';
            }

            // Month user spent the most time in
            stats.favMonth = monthTimeCounts[userId]?.indexOf(Math.max(...monthTimeCounts[userId]));
            // Get the ids in the map that have the highest counts
            if (taCounts[userId].size !== 0) {
                stats.favTaId = Array.from(taCounts[userId].entries()).reduce(
                    (prevEntry, nextEntry) => prevEntry[1] < nextEntry[1] ? nextEntry : prevEntry)[0];
            }
    
            if (stats.favTaId) {
            // only looking at the sessions from the favorite TA that match with sessions the user went to
                const resSession = TAsessions[stats.favTaId]?.filter( (TAsession) => 
                    officeHourSessions[userId].includes(TAsession.session) && TAsession.asker === userId);
                if (resSession?.length === 1) {
                    stats.favClass =  resSession[0].courseId;
                    stats.favDay = resSession[0].day;
                } else if (resSession?.length > 1) {
                /* filtering from general to specific:
                    - find mode class
                    - out of all the sessions for that class, find mode day
                */

                    const classFrequency: { [courseId: string]: number } = {};
                    const dayFrequency: { [day: number]: number } = {};

                    resSession.forEach((TAsession) => {
                        if (!classFrequency[TAsession.courseId]) {
                            classFrequency[TAsession.courseId] = 1;
                        } else {
                            classFrequency[TAsession.courseId] += 1;
                        }
                    });

                    const modeCourseId = Object.keys(classFrequency).reduce((courseId1, courseId2) =>
                        classFrequency[courseId1] > classFrequency[courseId2] ? courseId1 : courseId2);
                    resSession.forEach((TAsession) => {
                        if (TAsession.courseId === modeCourseId) {
                            if (!dayFrequency[TAsession.day]) {
                                dayFrequency[TAsession.day] = 1;
                            } else {
                                dayFrequency[TAsession.day] += 1;
                            }
                        }
                    });
                    const modeDay = Object.keys(dayFrequency).reduce((day1, day2) =>
                        dayFrequency[parseInt(day1, 10)] > dayFrequency[parseInt(day2,10)] ? day1 : day2);

                    const modeSessions = resSession.filter((TAsession) => TAsession.courseId === modeCourseId 
                && TAsession.day === parseInt(modeDay,10));
                    
                    // There could be multiple ties, so just picking the first one
                    stats.favClass =  modeSessions[0].courseId;
                    stats.favDay = modeSessions[0].day;

                }
            }
            count++;
        }
    }

    // ----- end of helper functions --------


    const sessionDocs = await getWrappedSessionDocs();
    let count = 0;
    for (const doc of questionsSnapshot.docs) {
        // Console statement for debugging
        if (count > 0 && count % 100 === 0) {
            // eslint-disable-next-line no-console
            console.log(`${count}/${questionsSnapshot.docs.length} questions processed.`)
        }
        const question = doc.data() as {
            answererId: string;
            askerId: string;
            sessionId: string;
            timeEntered: admin.firestore.Timestamp;
            timeAddressed: admin.firestore.Timestamp | undefined;
        };

        const { answererId, askerId, sessionId, timeEntered, timeAddressed } = question;

        initializeUser(answererId, askerId);
        // Office hour visits
        const sessionDoc = sessionDocs[sessionId];
        if (TAsessions[answererId].find((TAsession) => TAsession.session === sessionId) === undefined) {
            /* Since TA was active during this session and this is the first 
            time encountering the session, we add it to their timeHelped */
            if (sessionDoc.exists && userStats[answererId].timeHelpingStudents !== undefined ) {
                /* Add a total session time to the min TA helped */
                const timeHelping = (sessionDoc.get('endTime').toDate().getTime() 
                 - sessionDoc.get('startTime').toDate().getTime())/ 60000;
                // this should never be less than 0 (or 0, really)
                if (timeHelping >= 0) {
                    userStats[answererId].timeHelpingStudents = 
            (userStats[answererId].timeHelpingStudents ?? 0) + timeHelping;
                }
            } 
        }

        officeHourSessions[askerId] = officeHourSessions[askerId] || [];  
        if (!officeHourSessions[askerId].includes(sessionId)) { 
            officeHourSessions[askerId].push(sessionId); }

        if (answererId && timeAddressed) {
            TAsessions[answererId]?.push({
                session: sessionId,
                asker: askerId,
                courseId: sessionDoc.get('courseId'),
                day: timeAddressed.toDate().getDay()
            });

            if(!taCounts[askerId]?.has(answererId)) {
                taCounts[askerId]?.set(answererId, 1);
            } else if (answererId && taCounts[askerId]?.has(answererId)){
                const taAmt =  taCounts[askerId]?.get(answererId);
                taAmt && taCounts[askerId]?.set(answererId, taAmt + 1 );
            } 
        }

        // Minutes spent at office hours
        if (timeEntered) {
            if (timeAddressed) {
                const minutesSpent = (timeAddressed.toDate().getTime() - 
                timeEntered.toDate().getTime()) / 60000; // convert ms to minutes
                if (minutesSpent >= 0) {
                    userStats[askerId].totalMinutes += minutesSpent;
                } 
                monthTimeCounts[askerId][timeEntered.toDate().getMonth()] += minutesSpent;
            } else {
                userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
                monthTimeCounts[askerId][timeEntered.toDate().getMonth()] += 60;
            }
        }
        count++;
    }

    processStats();

    await updateWrappedDocs();

    // eslint-disable-next-line no-console
    errorUsers.forEach((errUser) => console.log(errUser.user + ": " + errUser.error));
}

(async () => {
    try {
        await getWrapped();
        // eslint-disable-next-line no-console
        console.log("Processing complete.");
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to update stats:", error);
    }
})();