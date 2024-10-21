import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');

// Initialize Firestore
const db = admin.firestore();

// Firestore Timestamps for the query range

const startDate = admin.firestore.Timestamp.fromDate(new Date('2024-01-22'));
const endDate = admin.firestore.Timestamp.fromDate(new Date('2024-12-21'));

const getWrapped = async () => {
    // Refs
    const questionsRef = db.collection('questions');
    const sessionsRef = db.collection('sessions');
    const wrappedRef = db.collection('wrapped-fa24');
    // const usersRef = db.collection('users-test');

    // Query all questions asked between FA23 and SP24
    const questionsSnapshot = await questionsRef
        .where('timeEntered', '>=', startDate)
        .where('timeEntered', '<=', endDate)
        .get();

    const userStats: { [userId: string]: {
        numVisits: number;
        favClass: string;
        favTitle: string;
        favTaId: string;
        totalMinutes: number;
        personalityType: string;
        timeHelpingStudents?: number;
    }} = {};

    const officeHourCounts: {[userId: string] : Map<string, number>} = {};
    const taCounts: {[userId: string] : Map<string, number>} = {};
    const officeHourSessions: { [userId: string]: string[]} = {};
    // Every taID has an array of objects, where the objects store a sessionId and askerId
    const TAsessions: {[taID:string]: {
        session: string; 
        asker: string
    }[]} = {};

    for (const doc of questionsSnapshot.docs) {
        const question = doc.data() as {
            answererId: string;
            askerId: string;
            sessionId: string;
            timeEntered: admin.firestore.Timestamp;
            timeAddressed: admin.firestore.Timestamp | undefined;
        };

        const { answererId, askerId, sessionId, timeEntered, timeAddressed } = question;

        // if an instance doesn't exist yet for the user, creating one
        if (!userStats[askerId]) {
            userStats[askerId] = {
                numVisits: 0,
                favClass: '',
                favTitle: '',
                favTaId: '',
                totalMinutes: 0,
                personalityType: '',
            };
            officeHourCounts[askerId] = new Map<string, number>();
            taCounts[askerId] = new Map<string, number>();
            officeHourSessions[askerId] = [];
        } 

        if (!userStats[answererId]) {
            userStats[answererId] = {
                numVisits: 0,
                favClass: '',
                favTitle: '',
                favTaId: '',
                totalMinutes: 0,
                personalityType: '',
                timeHelpingStudents: 0,
            };
            officeHourCounts[answererId] = new Map<string, number>();
            taCounts[answererId] = new Map<string, number>();
            officeHourSessions[answererId] = [];
            TAsessions[answererId] = [];
            // Checking if ta already showed up as student and now as an answerer
        } else if (userStats[answererId] && userStats[answererId]?.timeHelpingStudents === undefined) {
            userStats[answererId] = {
                numVisits: userStats[answererId].numVisits,
                favClass: userStats[answererId].favClass,
                favTitle: userStats[answererId].favTitle,
                favTaId: userStats[answererId].favTaId,
                totalMinutes: userStats[answererId].totalMinutes,
                personalityType: userStats[answererId].personalityType,
                timeHelpingStudents: 0,
            };
            officeHourCounts[answererId] = new Map<string, number>();
            taCounts[answererId] = new Map<string, number>();
            officeHourSessions[answererId] = [];
            TAsessions[answererId] = [];
            // eslint-disable-next-line no-console
            console.log("updating map for ta");
        }

        // Office hour visits
        

        if (TAsessions[answererId].find((elem) => elem.session === sessionId) === undefined) {
            /* Since TA was active during this session and this is the first 
            time encountering the session, we add it to their timeHelped */

            // eslint-disable-next-line no-await-in-loop
            const sessionDoc = await sessionsRef.doc(sessionId).get();
            if (sessionDoc.exists && userStats[answererId].timeHelpingStudents !== undefined ) {
                /* again using Math.ceil to try to get integer time values. 
                This is to add a total session time to the min TA helped */
                const timeHelping = Math.ceil((sessionDoc.get('endTime').toDate().getTime() 
                 - sessionDoc.get('startTime').toDate().getTime())/ 60000);
                // this should never be less than 0 (or 0, really)
                if (timeHelping >= 0) {
                    userStats[answererId].timeHelpingStudents = 
            (userStats[answererId].timeHelpingStudents ?? 0) + timeHelping;
                }
                
            } 
        }

        if (!officeHourSessions[askerId]?.includes(sessionId)) {
            officeHourSessions[askerId]?.push(sessionId);
        }

        if (sessionId !== undefined && sessionId !== "" && answererId !== "") {
            if (!officeHourCounts[askerId]?.has(sessionId)) {
                officeHourCounts[askerId]?.set(sessionId, 1);
            } else if (officeHourCounts[askerId]?.has(sessionId)) {
                const ohAmt = officeHourCounts[askerId]?.get(sessionId);
                ohAmt && officeHourCounts[askerId]?.set(sessionId, ohAmt + 1 );
            }
        }

        if (answererId !== undefined && answererId !== "") {
            // always push the question info to the array if ta answered
            TAsessions[answererId]?.push({
                session: sessionId,
                asker: askerId
            });

            if(!taCounts[askerId]?.has(answererId)) {
                taCounts[askerId]?.set(answererId, 1);
            } else if (answererId !== undefined && taCounts[askerId]?.has(answererId)){
                const taAmt =  taCounts[askerId]?.get(answererId);
                taAmt && taCounts[askerId]?.set(answererId, taAmt + 1 );
            } 
        }

        // Minutes spent at office hours
        if (timeEntered) {
            if (timeAddressed) {
                // Using Math.ceil for the edge case of addressed-entered < 60000 ms, 
                // which would result in a decimal number of minutes
                const minutesSpent = Math.ceil((timeAddressed.toDate().getTime() - 
            timeEntered.toDate().getTime()) / 60000); // convert ms to minutes
                if (minutesSpent < 0) {
                    userStats[askerId].totalMinutes += 0;
                    // eslint-disable-next-line no-console
                    console.log("ISSUE: Minutes spent is less than 0");
                }
                userStats[askerId].totalMinutes += minutesSpent;
            } else {
                userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
            }
        }
    }

    // Personality type will be calculated after processing all documents
    

    // Process personality type
    for (const [userId, stats] of Object.entries(userStats)) {
        stats.numVisits = officeHourSessions[userId]?.length;
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
        
        // Get the ids in the map that have the highest counts
        if (taCounts[userId].size !== 0) {
            stats.favTaId = Array.from(taCounts[userId].entries()).reduce((a, b) => a[1] < b[1] ? b : a)[0];
        }

        if (stats.favTaId && stats.favTaId !== "") {
            const resSession = TAsessions[stats.favTaId]?.filter( (elem) => 
                officeHourSessions[userId].includes(elem.session));
            // eslint-disable-next-line no-console
            console.log(`for user ${userId} og arr was 
${officeHourSessions[userId]} and for ta ${stats.favTaId} filtering now ${resSession}`);
            if (resSession?.length === 1) {
                // eslint-disable-next-line no-await-in-loop
                const sessionsDoc = await sessionsRef.doc(resSession[0].session).get()
                stats.favClass =  sessionsDoc.get("courseId");
                stats.favTitle = sessionsDoc.get("title");

            } else if (resSession?.length > 1) {
                // finding session that occurs the most
                const sessionFrequency: { [sessionId: string]: number } = {};
    
                // Count occurrences of each sessionId in resSession
                resSession.filter((elem) => elem.asker === userId).forEach((elem) => {
                    if (!sessionFrequency[elem.session]) {
                        sessionFrequency[elem.session] = 1;
                    } else {
                        sessionFrequency[elem.session] += 1;
                    }
                });

                // Find the session with the highest frequency
                const modeSessionId = Object.keys(sessionFrequency).reduce((a, b) =>
                    sessionFrequency[a] > sessionFrequency[b] ? a : b);
                // eslint-disable-next-line no-await-in-loop
                const sessionsDoc = await sessionsRef.doc(modeSessionId).get()
                stats.favClass =  sessionsDoc.get("courseId");
                stats.favTitle = sessionsDoc.get("title");
            }
        }
        
        // if (officeHourCounts[userId].size !== 0) {
        //     stats.favClass = 
        //     Array.from(officeHourCounts[userId].entries()).reduce((a, b) => a[1] < b[1] ? b : a)[0];
        // }

        // eslint-disable-next-line no-console
        console.log(`for user ${userId} fav class is ` + stats.favClass + " and fav ta is " + stats.favTaId);
        
        
    }

    

    // Update the wrapped collection
    const batch = db.batch();

    Object.entries(userStats).forEach(async ([userId, stats]) => {
        // Only want to make wrapped changes for a user if they have an ID and are active 
        if (userId) {
            /* Defition of active: 
                If a user is only a student, they need to have at least one OH visit. 
                If a user is a TA, they need to have at least one TA session AND at least one OH visit as a student.
            */
            if ((stats.numVisits > 0)
                && (stats.timeHelpingStudents === undefined ||TAsessions[userId]?.length > 0)
               && stats.favTaId !== ""
            ) {
                // eslint-disable-next-line no-console
                console.log("User " + userId + ` is an active student/TA  with ${stats.numVisits} visits`);
                // eslint-disable-next-line no-console
                TAsessions[userId] && console.log(`if ta, length of session 
                    is ${TAsessions[userId].length} and object is ${TAsessions[userId]}`);

                const wrappedDocRef = wrappedRef.doc(userId);
                batch.set(wrappedDocRef, stats);

                // const userDoc = await usersRef.doc(userId).get();
                // if (userDoc.exists) {
                //     usersRef.doc(userId).update({
                //         wrapped: true,
                //     });
                // } else {
                //     // Handle the case where the document does not exist
                //     // eslint-disable-next-line no-console
                //     console.log(`No document found for user ID ${userId}, skipping update.`);
                // }
            } else {
                // eslint-disable-next-line no-console
                console.log(`User ${userId} is NOT an active student/TA.`)
            }
            
        } else {
            // eslint-disable-next-line no-console
            console.log("User ID is undefined, skipping update.")
        }
       
    });

    await batch.commit();
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
