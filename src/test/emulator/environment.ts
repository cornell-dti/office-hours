import firebase from "firebase";
import {initTestAdminFirebase} from "./emulfirebase";
import {questionToSlot, randArr} from "../utils/utils";
import {
    addUsersToCourse,
    getDummyCourse,
    getDummyEditableUser,
    getDummyQuestionForSession, getDummyTags
} from "../generators/dummy";
import {getDummySessionSeries} from "../generators/dummysession";

// Helper methods for regulating QMI environments

interface InvariantResult {
    satisfied: boolean;
    failureReason?: string;
}

// Note that this is not exhaustive and doesn't check whether upvoted users are valid or not
export const satisfiesEnvironmentInvariants = (environment: FireEnvironment): InvariantResult => {
    // Grab unique IDs
    const userByIds = new Map(environment.users.map(user => [user.userId, user]));
    const sessionByIds = new Map(environment.sessions.map(session => [session.sessionId, session]));
    const coursesByIds = new Map(environment.courses.map(course => [course.courseId, course]));
    const tagsByIds = new Map(environment.tags.map( tag => [tag.tagId, tag]));
    const userEmails = new Set(environment.users.map(user => user.email));
    // Check course preconditions
    // Check that declared tas and professors actually exist and have their roles specified
    for (const course of environment.courses) {
        // Helper function in this context to assert expected role
        const assertExpectedRole = (userId: string, role: PrivilegedFireCourseRole): InvariantResult => {
            const taUser = userByIds.get(userId);
            if (taUser === undefined) {
                return {
                    satisfied: false,
                    failureReason: `Course ${course.courseId}'s ${role} ${userId} does not exist!`
                };
            }
            if (taUser.roles[course.courseId] !== role) {
                return {
                    satisfied: false,
                    failureReason:
                        `User ${userId} should have role ${role} for course ${course.courseId}`
                        + ` but had role ${taUser.roles[course.courseId]} instead!`
                }
            }
            return {
                satisfied: true
            }
        }

        for (const ta of course.tas){
            const result = assertExpectedRole(ta, 'ta');
            if (!result.satisfied) {
                return result;
            }
        }
        for (const prof of course.professors){
            const result = assertExpectedRole(prof, 'professor');
            if (!result.satisfied) {
                return result;
            }
        }

        // Check course start date before end date
        if (course.startDate.seconds >= course.endDate.seconds) {
            return {
                satisfied: false,
                failureReason: `Course ${course.courseId} starts before it ends!`
            };
        }
    }

    // Check that pending users haven't already been added
    for (const pendingUser of environment.pendingUsers){
        if (userEmails.has(pendingUser.email)){
            return {
                satisfied: false,
                failureReason:
                    `Pending User ${pendingUser.email}'s email is taken by some ` +
                    `existing user!`
            }
        }
    }

    // Check that questions have valid sessions
    // Check that question status is consistent
    // Check that answerers are either TA or professor for course
    for (const question of environment.questions){
        if (!sessionByIds.has(question.sessionId)){
            return {
                satisfied: false,
                failureReason:
                    `Question ${question.questionId} contains a session with` +
                    ` a non-existent session ID`
            };
        }
        if (question.status === "assigned" &&
            (question.timeAssigned === undefined ||
                question.timeAddressed !== undefined)){
            return {
                satisfied: false,
                failureReason:
                    `Question ${question.questionId} is assigned but either its time assigned is undefined`
                    + ` or its time addressed is defined`
            };
        }
        if (question.status === "resolved" &&
            (question.timeAssigned === undefined ||
                question.timeAddressed === undefined)){
            return {
                satisfied: false,
                failureReason:
                    `Question ${question.questionId} is resolved but either its time`
                    + ` assigned or time addressed is undefined`
            };
        }
        if (question.status === "unresolved" &&
            (question.timeAssigned !== undefined ||
                question.timeAddressed !== undefined)){
            return {
                satisfied: false,
                failureReason:
                    `Question ${question.questionId} is unresolved but either its time`
                    + ` assigned or time addressed is not undefined`
            };
        }
        const courseId = sessionByIds.get(question.sessionId)!.courseId;
        const answerer = userByIds.get(question.answererId);
        if (answerer === undefined){
            return {
                satisfied: false,
                failureReason: `Question answerer ${question.answererId} does not exist!`
            };
        }
        if (answerer.roles[courseId] === undefined){
            return {
                satisfied: false,
                failureReason:
                    `Question answerer ${question.answererId} is not a TA / Professor of the`
                    + ` associated course ${courseId}`
            };
        }
        // Assert primary and secondary tags
        const assertTagValid = (tag: FireTag | undefined, tagId: string, isPrimary: boolean): InvariantResult => {
            if (tag === undefined ||
                tag.courseId !== courseId ||
                (isPrimary && tag.parentTag !== undefined) ||
                (!isPrimary && tag.parentTag === undefined)){
                return {
                    satisfied: false,
                    failureReason:
                        `Question ${question.questionId} is associated with tag ${tagId}, but it did not` +
                        `exist / is not associated with the question's course / is not a` +
                        ` ${isPrimary ? "primary" : "secondary"} tag as expected`
                };
            }
            return {
                satisfied: true
            };
        }
        const primaryTag = tagsByIds.get(question.primaryTag);
        const secondaryTag = tagsByIds.get(question.secondaryTag);
        const primaryTagResult = assertTagValid(primaryTag, question.primaryTag, true);
        const secondaryTagResult = assertTagValid(secondaryTag, question.secondaryTag, false);
        if (!primaryTagResult.satisfied){
            return primaryTagResult;
        }
        if (!secondaryTagResult.satisfied){
            return secondaryTagResult;
        }
    }

    // Check that sessions are valid
    for (const session of environment.sessions){
        // Check that associated course is valid
        const course = coursesByIds.get(session.courseId);
        if (course === undefined){
            return {
                satisfied: false,
                failureReason:
                    `Session ${session.sessionId} is associated with course ${session.courseId} that`
                    + ` does not exist!`
            };
        }
        // Check that TAs are legit
        for (const ta of session.tas){
            const taUser = userByIds.get(ta);
            if (taUser === undefined || taUser.roles[session.courseId] === undefined){
                return {
                    satisfied: false,
                    failureReason:
                        `Session ${session.sessionId} is associated with TA ${ta} that either does`
                        + ` not exist or is not a TA / Prof of the associated course ${session.courseId}`
                };
            }
        }
        // Check course start date before end date
        if (session.startTime.seconds >= session.endTime.seconds) {
            return {
                satisfied: false,
                failureReason: `Session ${session.sessionId} starts before it ends!`
            };
        }
    }

    // Check that tags are valid
    for (const tag of environment.tags){
        if (tag.parentTag !== undefined) {
            const parent = tagsByIds.get(tag.parentTag);
            if (parent === undefined) {
                return {
                    satisfied: false,
                    failureReason:
                        `Tag ${tag.tagId}'s parent ${tag.parentTag} does not exist!`
                };
            }
            if (parent.level !== 1) {
                return {
                    satisfied: false,
                    failureReason:
                        `Tag ${tag.tagId}'s parent ${tag.parentTag} is not actually a parent!`
                };
            }
            if (tag.level !== 2) {
                return {
                    satisfied: false,
                    failureReason:
                        `Tag ${tag.tagId} has a parent ${tag.parentTag}, but it has level 1` +
                        ` and thus should not have a parent`
                };
            }
        } else if (tag.level !== 1){
            return {
                satisfied: false,
                failureReason:
                        `Tag ${tag.tagId} does not have a parent but it has level 2` +
                        ` and thus should have a parent`
            };
        }
    }

    // Check that users are valid
    for (const user of environment.users){
        for (const course of user.courses){
            if (!coursesByIds.has(course)){
                return {
                    satisfied: false,
                    failureReason: `User ${user.userId} has course ${course} that does not exist!`
                };
            }
        }
    }

    return {
        satisfied: true
    };
}

interface EnvironmentConfig {
    numCourses?: number;
    sessionSeriesPerCourse?: number;
    sessionsPerSeries?: number;
    questionsPerSession?: number;
    studentsPerCourse?: number;
    tasPerCourse?: number;
    profsPerCourse?: number;
    // Whether all questions are resolved
    resolvedQuestionsOnly?: boolean;
}

const getDummyUsers = (numUsers: number): FireEditableUser[] => {
    const result = [];
    for (let i = 0; i < numUsers; i++){
        result.push(getDummyEditableUser());
    }
    return result;
}

export const generateDummyEnvironment = (options: EnvironmentConfig): FireEnvironment => {
    const envCourses: FireCourse[] = [];
    const envUsers: FireUser[] = [];
    const envTags: FireTag[] = [];
    const envQuestions: FireQuestion[] = [];
    const envSessions: FireSession[] = [];
    const envPendingUsers: FirePendingUser[] = [];
    // Set config to options + defaults
    const config = {
        numCourses: options.numCourses === undefined ? 1 : options.numCourses,
        sessionSeriesPerCourse: options.sessionSeriesPerCourse === undefined ? 1 : options.sessionSeriesPerCourse,
        sessionsPerSeries: options.sessionsPerSeries === undefined ? 3 : options.sessionsPerSeries,
        questionsPerSession: options.questionsPerSession === undefined ? 5 : options.questionsPerSession,
        studentsPerCourse: options.studentsPerCourse === undefined ? 1 : options.studentsPerCourse,
        tasPerCourse: options.tasPerCourse === undefined ? 1 : options.tasPerCourse,
        profsPerCourse: options.profsPerCourse === undefined ? 1 : options.profsPerCourse,
        resolvedQuestionsOnly: options.resolvedQuestionsOnly === undefined ? true : options.resolvedQuestionsOnly,
    }
    // Note: This generation algorithm makes the assumption that TAs only TA
    // one class and Profs only teach one class
    // For each course
    for (let courseNum = 0; courseNum < config.numCourses ; courseNum++){
        const course = getDummyCourse();
        // Generate users
        const students = getDummyUsers(config.studentsPerCourse);
        const tas = getDummyUsers(config.tasPerCourse);
        const profs = getDummyUsers(config.profsPerCourse);
        addUsersToCourse(course, students, 'student');
        addUsersToCourse(course, tas, 'ta');
        addUsersToCourse(course, profs, 'professor');
        // Generate tags
        const tagStructure = getDummyTags(course);
        // Generate session series
        for (let seriesNum = 0; seriesNum < config.sessionSeriesPerCourse; seriesNum++){
            const series = getDummySessionSeries(course.courseId, config.sessionsPerSeries);
            for (const session of series){
                const questions = [];
                // Assign TAs
                session.tas.push(...tas.map(ta => ta.userId));
                // Assign questions with random statuses
                for (let questionNum = 0; questionNum < config.questionsPerSession; questionNum++){
                    let questionStatus: FireQuestion['status'] = 'resolved';
                    if (!config.resolvedQuestionsOnly){
                        questionStatus = randArr<FireQuestion['status']>(
                            ['assigned', 'resolved', 'retracted', 'unresolved', 'no-show']
                        );
                    }
                    questions.push(getDummyQuestionForSession(session, tas, students, questionStatus, tagStructure))
                }
            }
        }
    }
    return {
        courses: envCourses,
        pendingUsers: envPendingUsers,
        questions: envQuestions,
        sessions: envSessions,
        tags: envTags,
        users: envUsers
    }
}

export const setupQMIEnvironment = async (env: FireEnvironment) => {
    const admin = initTestAdminFirebase();
    const promises: Promise<void>[] = [];
    // Generate courses
    for (const course of env.courses){
        const courseRef = admin.collection("courses").doc(course.courseId);
        // This destructuring syntax gets rid of the courseId field
        const {courseId, ...setCourse} = course;
        promises.push(courseRef.set(setCourse));
    }
    // Generate pending users
    for (const pendingUser of env.pendingUsers){
        const pendingRef = admin.collection("pendingUsers").doc(pendingUser.email);
        promises.push(pendingRef.set(pendingUser));
    }
    // Generate questions and question slots
    for (const question of env.questions){
        const questionRef = admin.collection("questions").doc(question.questionId);
        const questionSlotRef = admin.collection("questionSlots").doc(question.questionId);
        const {questionId, ...setQuestion} = question;
        const {questionId: questionSlotId, ...setQuestionSlot} = questionToSlot(question);
        promises.push(questionRef.set(setQuestion));
        promises.push(questionSlotRef.set(setQuestionSlot));
    }
    // Generate sessions
    for (const session of env.sessions){
        const sessionRef = admin.collection("sessions").doc(session.sessionId);
        const {sessionId, ...setSession} = session;
        promises.push(sessionRef.set(setSession));
    }
    // Generate tags
    for (const tag of env.tags){
        const tagRef = admin.collection("tags").doc(tag.tagId);
        const {tagId, ...setTag} = tag;
        promises.push(tagRef.set(setTag));
    }
    // Generate users
    for (const user of env.users){
        const userRef = admin.collection("users").doc(user.userId);
        const {userId, ...setUser} = user;
        promises.push(userRef.set(setUser));
    }
    await Promise.all(promises);
}

// Reads the current firebase environment, asserts invariants, then returns the corresponding environment
// This is an expensive operation. If testing single objects, always prefer asserting object directly
export const firebaseToEnvironment = async (db: firebase.firestore.Firestore): Promise<FireEnvironment> => {
    // TODO: Implement
    // TODO: Assert Question Slot invariants
    return Promise.reject(new Error("Not implemented"));
}
