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
    const wrappedRef = db.collection('wrapped');
    const usersRef = db.collection('users');

    // Query all questions asked between FA23 and SP24
    const questionsSnapshot = await questionsRef
        .where('timeEntered', '>=', startDate)
        .where('timeEntered', '<=', endDate)
        .get();

    const userStats: { [userId: string]: {
        officeHourVisits: string[];
        totalMinutes: number;
        personalityType: string;
        timeHelpingStudents?: number;
    }} = {};

    // need to make new field- favTa
    /* ideas:
        - make a dictionary with key userId and values where it's a taID and a count of how many times user has met them
        cannot just do session ids because some sessions have multiple TAs
        this feels like a lot of new storage and work, not sure if it could be more efficient? 
        - make a count field in TA sessions
        issue is most frequent session might not match most common TA
        consider a case where a session may not have TA (maybe it's professors oh)
        - if we're going with sessions, 
    */

    // mapping taID to the count of times user met with them
    const taCounts: {[taID: string]: int} = {};
    // will have data for the session for each ta that people actually asked questions in
    // CONSIDER: for students we are checking they had at least one OH, we should check the same for TA
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

        // if a mapping doesn't exist yet for the user, we are creating one
        if (!userStats[askerId]) {
            userStats[askerId] = {
                officeHourVisits: [],
                totalMinutes: 0,
                personalityType: '',
            };
        } 

        if (!userStats[answererId]) {
            userStats[answererId] = {
                officeHourVisits: [],
                totalMinutes: 0,
                personalityType: '',
                timeHelpingStudents: 0,
            };
        }
        // officehoursvisits is a string array of all the string "sessionIDs" 
        /* officehourvists starts out empty for each user. as we go through
        each sessionId for each question, if an asker active in a session then
        that session gets added to the array of total visits */

        // Office hour visits
        if (!userStats[askerId].officeHourVisits?.includes(sessionId)) {
            userStats[askerId].officeHourVisits?.push(sessionId);
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
            // check if this session for a sessionId doesn't exist for some reason 
            // check if endTime and startTime exist? would assume they always have to
            if (sessionDoc.exists && userStats[answererId].timeHelpingStudents !== undefined ) {
                // again using Math.ceil to try to get integer time values. This is to add a total session time to the minutes TA has helped
                const timeHelping = Math.ceil((sessionDoc.get('endTime').toDate().getTime()  - sessionDoc.get('startTime').toDate().getTime())/ 60000);
                // this should never be less than 0 (or 0, really)
                if (timeHelping >= 0) {
                    userStats[answererId].timeHelpingStudents += timeHelping;
                }
                
            } 


        }
    }

    // Personality type will be calculated after processing all documents
    

    // Process personality type
    for (const [, stats] of Object.entries(userStats)) {
        const sessionCount = stats.officeHourVisits.length;
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
    }

    // Update the wrapped collection
    const batch = db.batch();

    Object.entries(userStats).forEach(async ([userId, stats]) => {
        // Only want to make wrapped changes for a user if they have an ID and are active 
        if (userId) {
            // case that user is only a student, they need to have at least one OH visit
            if ((stats.timeHelpingStudents === undefined && stats.officeHourVisits.length <= 0)
                || (stats.timeHelpingStudents !== undefined && TAsessions[userId].length <= 0)
            ) {
                // eslint-disable-next-line no-console
                console.log("User is not an active student/TA.")
            } else {
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
