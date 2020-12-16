import moment from "moment-timezone";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// 1 - discount factor for weighted statistics
const alpha = 0.2;

const getCurrDay = () : moment.Moment => {
    return moment.tz({hour: 0, minute: 0, second: 0, millisecond: 0}, "America/New_York");
}

const cmpTimestamps = (a : FireTimestamp | undefined, b : FireTimestamp | undefined) : number => {
    if (a === undefined && b === undefined){
        return 0;
    } else if (a === undefined){
        return -1;
    } else if (b === undefined){
        return 1;
    }
    if (a.seconds === b.seconds){
        return a.nanoseconds - b.nanoseconds;
    }
    return a.seconds - b.seconds;
}

const getEnteredByHour = (questions : FireQuestion[]) : number[] => {
    let enteredByHour : number[] = [];

    const hoursInDay = 24;

    for (let i = 0; i < hoursInDay; i++){
        enteredByHour.push(0);
    }

    const questionsByTimeEntered = [...questions];
    questionsByTimeEntered.sort( (a, b) => {
        return cmpTimestamps(a.timeEntered, b.timeEntered);
    });

    let currTime = getCurrDay().subtract(1, 'days').add(1, 'hours');
    let dayStart = moment(currTime);
    let arrIdx = 0;
    let hourCnt = 0;

    for (let question of questionsByTimeEntered){
        // currTime.unix gives seconds since unix epoch
        // Eliminate questions that start on a previous day
        if (question.timeEntered.seconds < dayStart.unix()){
            continue;
        }
        if (question.timeEntered.seconds < currTime.unix()){
            hourCnt += 1;
            continue;
        }
        while (question.timeEntered.seconds >= currTime.unix() && arrIdx < hoursInDay){
            currTime = currTime.add(1, 'hours');
            enteredByHour[arrIdx] = hourCnt;
            arrIdx += 1;
            hourCnt = 0;
        }
        hourCnt += 1;
    }
    // Fill out last information
    enteredByHour[arrIdx] = hourCnt;

    return enteredByHour;
}

// arr must have 24 elements
const commitInterval = (arr : number[],
                        intStart : number,
                        intEnd : number,
                        dayStart : number) => {
    const secPerHour = 60 * 60;
    let hourStart = dayStart;
    let hourEnd = dayStart + secPerHour;
    for (let i = 0; i < 24; i++){
        arr[i] += Math.max(0, Math.min(intEnd, hourEnd) - Math.max(intStart, hourStart));
    }
}

const getTAsByHour = (questions : FireQuestion[]) : number[] => {
    // Split questions by TA IDs
    let questionsByTA : Map<string, FireQuestion[]> = new Map();
    for (const question of questions){
        let arr : FireQuestion[] = [];
        if (questionsByTA.has(question.answererId)){
            arr = questionsByTA.get(question.answererId)!;
        }
        arr.push(question);
        questionsByTA.set(question.answererId, arr);
    }

    const tasByHour : number[] = [];

    for (let i = 0; i < 24; i++){
        tasByHour.push(0);
    }

    // Foreach TA, split availability by hour

    const secPerMin = 60;
    const tolerance = 15 * secPerMin;
    const yesterday = getCurrDay().subtract(1, 'days').unix();

    for (const entry of questionsByTA){
        const taQuestions = entry[1];
        const taQuestionsByAssigned = [...taQuestions];
        taQuestionsByAssigned.sort( (a, b) => {
            return cmpTimestamps(a.timeAssigned, b.timeAssigned);
        });

        // Must have at least one entry to be in map
        let currStart = taQuestionsByAssigned[0].timeAssigned
            ? taQuestionsByAssigned[0].timeAssigned.seconds : Infinity;
        let currEnd = taQuestionsByAssigned[0].timeAddressed
            ? taQuestionsByAssigned[0].timeAddressed.seconds : Infinity;

        // Merge questions with some tolerance to get time intervals
        for (let i = 1; i < taQuestionsByAssigned.length; i++){
            let currQuestion = taQuestionsByAssigned[i];
            let nextStart = currQuestion.timeAssigned
                ? currQuestion.timeAssigned.seconds : Infinity;
            let nextEnd = currQuestion.timeAddressed
                ? currQuestion.timeAddressed.seconds : Infinity;
            // Can we merge intervals?
            if (nextStart - currEnd < tolerance){
                currStart = Math.min(currStart, nextStart);
                currEnd = Math.max(currEnd, nextEnd);
            } else {
                // Commit current interval
                commitInterval(tasByHour, currStart, currEnd, yesterday);
                currStart = nextStart;
                currEnd = nextEnd;
            }
        }
        // Commit interval
        commitInterval(tasByHour, currStart, currEnd, yesterday);
    }

    return tasByHour;
}

const getQnsInQueueByHour = (questions : FireQuestion[]) : number[] => {
    let qnsInQueueByHour : number[] = [];

    for (let i = 0; i < 24; i++){
        qnsInQueueByHour.push(0);
    }

    let yesterday = getCurrDay().subtract(1, 'days').unix();

    for (const question of questions){
        commitInterval(qnsInQueueByHour,
            question.timeEntered.seconds,
            question.timeAssigned ? question.timeAssigned.seconds : question.timeEntered.seconds,
            yesterday);
    }

    return qnsInQueueByHour;
}

const getAvgWaitTimeOneTA = (questions : FireQuestion[], numTAsByHour: number[]) : number => {
    // Must not mutate numTAsByHour
    // Compute number of questions entered by hour
    const questionsByTimeEntered = [...questions];
    questionsByTimeEntered.sort( (a, b) => {
        return cmpTimestamps(a.timeEntered, b.timeEntered);
    });

    const questionsByTimeAssigned = [...questions];
    questionsByTimeAssigned.sort( (a,b) => {
        return cmpTimestamps(a.timeAssigned, b.timeAssigned);
    });
    let currTime = 0;
    let qnsInQueue = 0;
    let enteredPtr = 0;
    let assignedPtr = 0;
    // TODO: Implement
    while (enteredPtr < questions.length || assignedPtr < questions.length){
        if (enteredPtr >= questions.length){
            // Advance assigned pointer
        } else if (assignedPtr >= questions.length){
            // Advance entered pointer
        } else {
            // Advance minimum of the two pointers
        }
    }
}

const deriveStats = (questions : FireQuestion[]) : FireStats => {
    const enteredByHour = getEnteredByHour(questions);
    const tasByHour = getTAsByHour(questions);
    return {
        avgWaitTimePerQnOneTA: getAvgWaitTimeOneTA(questions, tasByHour),
        enteredByHour: enteredByHour,
        numQnsInQueueByHour: getQnsInQueueByHour(questions),
        // Number of questions that were asked during this day
        numQuestions: enteredByHour.length,
        numTAsByHour: tasByHour
    }
}

const mergeArr = (currArr : number[], newArr : number[]) : number[] => {
    const result : number[] = [];
    for (let i = 0; i < Math.min(currArr.length, newArr.length); i++){
        result.push(mergeNum(currArr[i], newArr[i] * alpha));
    }
    return result;
}

const mergeNum = (currNum : number, newNum : number) : number => {
    return currNum * (1 - alpha) + newNum * alpha;
}

const mergeStats = (currStats : FireStats, newStats : FireStats) : FireStats => {
    return {
        avgWaitTimePerQnOneTA: mergeNum(currStats.avgWaitTimePerQnOneTA, newStats.avgWaitTimePerQnOneTA),
        enteredByHour: mergeArr(currStats.enteredByHour, newStats.enteredByHour),
        numQnsInQueueByHour: mergeArr(currStats.numQnsInQueueByHour, newStats.numQnsInQueueByHour),
        numQuestions: mergeNum(currStats.numQuestions, newStats.numQuestions),
        numTAsByHour: mergeArr(currStats.numTAsByHour, newStats.numTAsByHour)
    };
}

const handleCourse = (db : FirebaseFirestore.Firestore,
                      course : FirebaseFirestore.QueryDocumentSnapshot) : Promise<any> => {
    const courseId = course.id;
    // Get sessions that happened in the last week
    // Get current time
    const today = getCurrDay();
    const yesterday = moment(today).subtract(1, 'days');

    // Look for office hours that have started before today and ended after yesterday
    // (ie have intersections with yesterday at some point)
    const sessionQuery = db.collection("sessions")
        .where("courseId", "==", courseId)
        .where("startTime", "<=", admin.firestore.Timestamp.fromDate(today.toDate()))
        .where("endTime", ">=", admin.firestore.Timestamp.fromDate(yesterday.toDate()));
    return sessionQuery.get().then( (querySnapshot) => {
        const promises : Promise<any>[] = [];
        querySnapshot.forEach( (session) => {
            promises.push(handleSession(db, courseId, yesterday, session));
        });
        return Promise.all(promises);
    });
}

const handleSession = (db : FirebaseFirestore.Firestore,
                    courseId : string,
                    yesterday : moment.Moment,
                    session : FirebaseFirestore.QueryDocumentSnapshot) : Promise<any> => {
    const sessionId = session.id;
    const questionQuery = db.collection("questions")
        .where("sessionId", "==", sessionId);
    return questionQuery.get().then( (snapshot) => {
        const questions : FireQuestion[] = [];
        snapshot.forEach( (questionDoc) => {
            questions.push(questionDoc.data() as FireQuestion);
        })
        const docId = `${courseId}_${yesterday.weekday()}`;
        // Get current stats
        return db.collection("stats").doc(docId).get()
            .then( (statsSnapshot) => {
                let newStats = deriveStats(questions);
                if (statsSnapshot.exists){
                    newStats = mergeStats(statsSnapshot.data() as FireStats, newStats);
                }
                return db.collection("stats").doc(docId).set(
                    newStats
                );
            });
    });
}

export default (db : FirebaseFirestore.Firestore) => {
    return functions
        // Run with 5 mins timeout
        .runWith({
            timeoutSeconds: 300
        })
        // At 12:30am ET
        // Use "30 0 * * *" for deployment
        // Use "*/5 * * * *" for testing (every 5 minutes)
        .pubsub.schedule("*/5 * * * *")
        .timeZone("America/New_York")
        .onRun(async () => {
            // Get all courses
            const coursesRef = db.collection("courses");
            const courses = await coursesRef.get();

            const promises : Promise<any>[] = [];
            courses.forEach( (course) => {
                promises.push(handleCourse(db, course));
            })
            return Promise.all(promises);
        });
}
