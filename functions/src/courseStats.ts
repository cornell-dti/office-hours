import moment from "moment-timezone";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// 1 - discount factor for weighted statistics
const alpha = 0.2;

export const getCurrDay = (): moment.Moment => {
    return moment.tz({hour: 0, minute: 0, second: 0, millisecond: 0}, "America/New_York");
}

export const getQuestionDuration = (question : FireQuestion): number => {
    let startTime = question.timeEntered.seconds;
    let endTime = question.timeAssigned?.seconds;
    if (endTime === undefined){
        endTime = question.timeEntered.seconds;
    }
    return endTime - startTime;
}

export const cmpTimestamps = (a: FireTimestamp | undefined, b: FireTimestamp | undefined): number => {
    if (a === undefined && b === undefined){
        return 0;
    } if (a === undefined){
        return -1;
    } if (b === undefined){
        return 1;
    }
    if (a.seconds === b.seconds){
        return a.nanoseconds - b.nanoseconds;
    }
    return a.seconds - b.seconds;
}

export const getEnteredByHour = (yesterday : moment.Moment, questions: FireQuestion[]): number[] => {
    const enteredByHour: number[] = [];

    const hoursInDay = 24;

    for (let i = 0; i < hoursInDay; i++){
        enteredByHour.push(0);
    }

    const questionsByTimeEntered = [...questions];
    questionsByTimeEntered.sort( (a, b) => {
        return cmpTimestamps(a.timeEntered, b.timeEntered);
    });

    let currTime = moment(yesterday).add(1, 'hours');
    const dayStart = moment(currTime);
    let arrIdx = 0;
    let hourCnt = 0;

    for (const question of questionsByTimeEntered){
        if (question.timeEntered.seconds < dayStart.unix()){
            continue;
        }
        // currTime.unix gives seconds since unix epoch
        // Eliminate questions that start on a previous day
        if (question.timeEntered.seconds >= dayStart.unix()){
            if (question.timeEntered.seconds >= currTime.unix()){
                while (question.timeEntered.seconds >= currTime.unix() && arrIdx < hoursInDay){
                    currTime = currTime.add(1, 'hours');
                    enteredByHour[arrIdx] = hourCnt;
                    arrIdx += 1;
                    hourCnt = 0;
                }
            }
            hourCnt += 1;
        }
    }
    // Fill out last information
    if (arrIdx < hoursInDay){
        enteredByHour[arrIdx] = hourCnt;
    }


    return enteredByHour;
}

// arr must have 24 elements
// arr is in hours
export const commitInterval = (arr: number[],
    intStart: number,
    intEnd: number,
    dayStart: number) => {
    const secPerHour = 60 * 60;
    let hourStart = dayStart;
    let hourEnd = dayStart + secPerHour;
    for (let i = 0; i < 24; i++){
        arr[i] += Math.max(0, Math.min(intEnd, hourEnd) - Math.max(intStart, hourStart)) / secPerHour;
        hourStart += secPerHour;
        hourEnd += secPerHour;
    }
}

export const getTAsByHour = (yesterday : moment.Moment, questions: FireQuestion[]): number[] => {
    // Split questions by TA IDs
    const questionsByTA: Map<string, FireQuestion[]> = new Map();
    for (const question of questions){
        let arr: FireQuestion[] = [];
        if (questionsByTA.has(question.answererId)){
            arr = questionsByTA.get(question.answererId)!;
        }
        arr.push(question);
        questionsByTA.set(question.answererId, arr);
    }

    const tasByHour: number[] = [];

    for (let i = 0; i < 24; i++){
        tasByHour.push(0);
    }

    // Foreach TA, split availability by hour

    const secPerMin = 60;
    const tolerance = 15 * secPerMin; // 15 mins merge tolerance
    const yesterdaySecs = yesterday.unix();

    questionsByTA.forEach((taQuestions) => {
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
            const currQuestion = taQuestionsByAssigned[i];
            const nextStart = currQuestion.timeAssigned
                ? currQuestion.timeAssigned.seconds : Infinity;
            const nextEnd = currQuestion.timeAddressed
                ? currQuestion.timeAddressed.seconds : Infinity;
            // Can we merge intervals?
            if (nextStart - currEnd < tolerance){
                currStart = Math.min(currStart, nextStart);
                currEnd = Math.max(currEnd, nextEnd);
            } else {
                // Commit current interval
                commitInterval(tasByHour, currStart, currEnd, yesterdaySecs);
                currStart = nextStart;
                currEnd = nextEnd;
            }
        }
        // Commit interval
        commitInterval(tasByHour, currStart, currEnd, yesterdaySecs);
    });

    return tasByHour;
}

export const getHourFromTimestamp = (yesterday: moment.Moment, timestamp: FireTimestamp) : number => {
    const time = moment.unix(timestamp.seconds);
    return Math.max(Math.min(time.diff(yesterday, 'hours'), 23), 0);
}

export const getQnsInQueueByHour = (yesterday: moment.Moment, questions: FireQuestion[]): number[] => {
    const qnsInQueueByHour: number[] = [];

    for (let i = 0; i < 24; i++){
        qnsInQueueByHour.push(0);
    }

    const yesterdaySecs = yesterday.unix();

    for (const question of questions){
        commitInterval(qnsInQueueByHour,
            question.timeEntered.seconds,
            question.timeAssigned ? question.timeAssigned.seconds : question.timeEntered.seconds,
            yesterdaySecs);
    }

    return qnsInQueueByHour;
}

export const getAvgWaitTimeOneTA = (yesterday: moment.Moment,
                                    questions: FireQuestion[],
                                    numTAsByHour: number[]): number => {
    // Compute this cheaply

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
    let qnsInQueue = 0;
    let estimateSumOneTA = 0;
    let enteredPtr = 0;
    let assignedPtr = 0;
    // Calculate queue position for each question according to time entered
    const queuePos = [];
    for (let i = 0; i < questionsByTimeEntered.length; i++){
        queuePos.push(0);
    }
    while (enteredPtr < questions.length || assignedPtr < questions.length){
        let updateAssigned = false;
        if (enteredPtr >= questions.length){
            // Advance assigned pointer
            assignedPtr += 1;
            updateAssigned = true;
        } else if (assignedPtr >= questions.length){
            // Advance entered pointer
            enteredPtr += 1;
        } else {
            // Advance minimum of the two pointers
            if (cmpTimestamps(
                    questionsByTimeEntered[enteredPtr].timeEntered,
                    questionsByTimeAssigned[assignedPtr].timeAssigned
                ) <= 0){
                enteredPtr += 1;
            } else {
                assignedPtr += 1;
                updateAssigned = true;
            }
        }
        if (updateAssigned){
            qnsInQueue -= 1;
        } else {
            // Reach an entered question
            //console.log("Entered");
            qnsInQueue += 1;
            queuePos[enteredPtr - 1] = qnsInQueue;
        }
    }

    for (let i = 0; i < questionsByTimeEntered.length; i++) {
        const question = questionsByTimeEntered[i];
        const questionResponseTime = getQuestionDuration(question);
        const questionHour = getHourFromTimestamp(yesterday, question.timeEntered);
        //console.log(`Response Time: ${questionResponseTime}, In Queue: ${queuePos[i]}, Hour: ${questionHour}`);
        estimateSumOneTA += questionResponseTime / queuePos[i] * Math.ceil(numTAsByHour[questionHour]);
        //console.log(`Estimate Sum: ${estimateSumOneTA}`);
        //console.log("Assigned");
    }
    return estimateSumOneTA / questions.length;
}

const deriveStats = (yesterday: moment.Moment, questions: FireQuestion[]): FireStats => {
    const enteredByHour = getEnteredByHour(yesterday, questions);
    const tasByHour = getTAsByHour(yesterday, questions);
    return {
        // In seconds
        avgWaitTimePerQnOneTA: getAvgWaitTimeOneTA(yesterday, questions, tasByHour),
        enteredByHour,
        numQnsInQueueByHour: getQnsInQueueByHour(yesterday, questions),
        // Number of questions that were asked during this day
        numQuestions: questions.length,
        numTAsByHour: tasByHour
    }
}

const mergeArr = (currArr: number[], newArr: number[]): number[] => {
    const result: number[] = [];
    for (let i = 0; i < Math.min(currArr.length, newArr.length); i++){
        result.push(mergeNum(currArr[i], newArr[i] * alpha));
    }
    return result;
}

const mergeNum = (currNum: number, newNum: number): number => {
    return currNum * (1 - alpha) + newNum * alpha;
}

const mergeStats = (currStats: FireStats, newStats: FireStats): FireStats => {
    return {
        avgWaitTimePerQnOneTA: mergeNum(currStats.avgWaitTimePerQnOneTA, newStats.avgWaitTimePerQnOneTA),
        enteredByHour: mergeArr(currStats.enteredByHour, newStats.enteredByHour),
        numQnsInQueueByHour: mergeArr(currStats.numQnsInQueueByHour, newStats.numQnsInQueueByHour),
        numQuestions: mergeNum(currStats.numQuestions, newStats.numQuestions),
        numTAsByHour: mergeArr(currStats.numTAsByHour, newStats.numTAsByHour)
    };
}

const handleCourse = (db: FirebaseFirestore.Firestore,
    course: FirebaseFirestore.QueryDocumentSnapshot): Promise<any> => {
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
        const promises: Promise<any>[] = [];
        querySnapshot.forEach( (session) => {
            promises.push(handleSession(db, courseId, yesterday, session));
        });
        return Promise.all(promises);
    });
}

const handleSession = (db: FirebaseFirestore.Firestore,
    courseId: string,
    yesterday: moment.Moment,
    session: FirebaseFirestore.QueryDocumentSnapshot): Promise<any> => {
    const sessionId = session.id;
    const questionQuery = db.collection("questions")
        .where("sessionId", "==", sessionId);
    return questionQuery.get().then( (snapshot) => {
        const questions: FireQuestion[] = [];
        snapshot.forEach( (questionDoc) => {
            questions.push(questionDoc.data() as FireQuestion);
        });
        const docId = `${courseId}_${yesterday.weekday()}`;
        // Get current stats
        return db.collection("stats").doc(docId).get()
            .then( (statsSnapshot) => {
                let newStats = deriveStats(yesterday, questions);
                if (statsSnapshot.exists){
                    newStats = mergeStats(statsSnapshot.data() as FireStats, newStats);
                }
                return db.collection("stats").doc(docId).set(
                    newStats
                );
            });
    });
}

export default (db: FirebaseFirestore.Firestore) => {
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

            const promises: Promise<any>[] = [];
            courses.forEach( (course) => {
                promises.push(handleCourse(db, course));
            })
            return Promise.all(promises);
        });
}
