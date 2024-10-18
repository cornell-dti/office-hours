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
// EDIT: possibly make these dates as new constants in constants.ts, 
// would make it easier to edit for other years

const startDate = admin.firestore.Timestamp.fromDate(new Date('2023-08-20'));
const endDate = admin.firestore.Timestamp.fromDate(new Date('2024-05-19'));

const getWrapped = async () => {
    // Refs
    const questionsRef = db.collection('questions');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        favOfficeHourId: string;
        favTaId: string;
        totalMinutes: number;
        personalityType: string;
        timeHelpingStudents?: number;
    }} = {};

    const officeHourCounts: {[userId: string] : Map<string, number>} = {}
    const taCounts: {[userId: string] : Map<string, number>} = {}
    const TAsessions: { [taID: string]: string[]} = {};
    // looking at each question - what session was it? who asked and answered?
    for (const doc of questionsSnapshot.docs) {
        const question = doc.data() as {
            answererId: string;
            askerId: string;
            sessionId: string;
            timeEntered: admin.firestore.Timestamp;
            timeAddressed: admin.firestore.Timestamp | undefined;
        };

        

        const { answererId, askerId, sessionId, timeEntered, timeAddressed } = question;

        // eslint-disable-next-line no-await-in-loop
        const person = await usersRef.doc(askerId).get();
        // eslint-disable-next-line no-console
        console.log("asker (" + askerId + ") is " + person.get("firstName"));

        // if an instance doesn't exist yet for the user, creating one
        if (!userStats[askerId]) {
            userStats[askerId] = {
                numVisits: 0,
                favOfficeHourId: '',
                favTaId: '',
                totalMinutes: 0,
                personalityType: '',
            };
            officeHourCounts[askerId] = new Map<string, number>();
            taCounts[askerId] = new Map<string, number>();
        } 

        

        if (!userStats[answererId]) {
            userStats[answererId] = {
                numVisits: 0,
                favOfficeHourId: '',
                favTaId: '',
                totalMinutes: 0,
                personalityType: '',
                timeHelpingStudents: 0,
            };
            officeHourCounts[answererId] = new Map<string, number>();
            taCounts[answererId] = new Map<string, number>();
            // Checking if ta already showed up as student and now as an answerer
        } else if (userStats[answererId] && userStats[answererId]?.timeHelpingStudents === undefined) {
            userStats[answererId] = {
                numVisits: userStats[answererId].numVisits,
                favOfficeHourId: userStats[answererId].favOfficeHourId,
                favTaId: userStats[answererId].favTaId,
                totalMinutes: userStats[answererId].totalMinutes,
                personalityType: userStats[answererId].personalityType,
                timeHelpingStudents: 0,
            };
            // eslint-disable-next-line no-console
            console.log("updating map for ta");
        }

        // Office hour visits

        /* if you ask multiple questions during the same session id, what does that do? */
        
        if (!officeHourCounts[askerId]?.has(sessionId)) {
            // userStats[askerId].officeHourVisits?.push(sessionId);
            officeHourCounts[askerId]?.set(sessionId, 1);
        

        } else if (officeHourCounts[askerId]?.has(sessionId)) {
            const ohAmt = officeHourCounts[askerId]?.get(sessionId);
            ohAmt && officeHourCounts[askerId]?.set(sessionId, ohAmt + 1 );
            
        }

        

        if (taCounts[askerId] && answererId !== undefined && answererId !== "") {
            if(!taCounts[askerId]?.has(answererId)) {
                taCounts[askerId]?.set(answererId, 1);
            } else if (taCounts[askerId]?.has(answererId)){
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
                userStats[askerId].totalMinutes += minutesSpent;

                if (minutesSpent <= 0) {
                    // eslint-disable-next-line no-console
                    console.log("ISSUE: Minutes spent is a 0 or less");
                }
    
            } else {
                userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
            }
        }

        if (!TAsessions[answererId]?.includes(sessionId)) {
            TAsessions[answererId]?.push(sessionId);
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
                    userStats[answererId].timeHelpingStudents += timeHelping;
                }
                
            } 


        }
    }

    // Personality type will be calculated after processing all documents
    

    // Process personality type
    for (const [userId, stats] of Object.entries(userStats)) {
        const sessionCount = officeHourCounts[userId].size;
        const weeksInRange = (endDate.toDate().getTime() - startDate.toDate().getTime())
        / (1000 * 60 * 60 * 24 * 7); // convert ms to weeks
        const averageSessionsPerWeek = sessionCount / weeksInRange;

        if (averageSessionsPerWeek >= 2) {
            stats.personalityType = 'Consistent';
        } else if (averageSessionsPerWeek >= 0.5) {
            stats.personalityType = 'Resourceful';
        } else {
            stats.personalityType = 'Independent';
        }
        // Get the ids in the map that have the highest counts
        if (officeHourCounts[userId].size !== 0) {
            stats.favOfficeHourId = 
            Array.from(officeHourCounts[userId].entries()).reduce((a, b) => a[1] < b[1] ? b : a)[0];
        }
        if (taCounts[userId].size !== 0) {
            stats.favTaId = Array.from(taCounts[userId].entries()).reduce((a, b) => a[1] < b[1] ? b : a)[0];
        }
        stats.numVisits = officeHourCounts[userId].size;

        // eslint-disable-next-line no-console
        console.log(`for user ${userId} fav oh is ` + stats.favOfficeHourId + " and fav ta is " + stats.favTaId);
        // eslint-disable-next-line no-console
        console.log("oh size" + officeHourCounts[userId].size + " and ta size " + taCounts[userId].size);
        
        
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
            if ((officeHourCounts[userId].size > 0)
                && (stats.timeHelpingStudents === undefined ||TAsessions[userId]?.length > 0)
            ) {
                // eslint-disable-next-line no-console
                console.log("User " + userId + " is an active student/TA.")

                const wrappedDocRef = wrappedRef.doc(userId);
                batch.set(wrappedDocRef, stats);

                const userDoc = await usersRef.doc(userId).get();
                if (userDoc.exists) {
                    usersRef.doc(userId).update({
                        wrapped: true,
                    });
                } else {
                    // Handle the case where the document does not exist
                    // eslint-disable-next-line no-console
                    console.log(`No document found for user ID ${userId}, skipping update.`);
                }
            } else {
                // eslint-disable-next-line no-console
                console.log("User is NOT an active student/TA.")
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
