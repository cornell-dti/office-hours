
// Helper methods for regulating QMI environments

import {initTestAdminFirebase} from "./emulfirebase";
import {questionToSlot, randArr} from "../utils/utils";
import {
    addUsersToCourse,
    getDummyCourse,
    getDummyEditableUser,
    getDummyQuestionForSession,
    getDummyUser
} from "../generators/dummy";
import {getDummySession, getDummySessionSeries} from "../generators/dummysession";

export const satisfiesEnvironmentInvariants = (environment: FireEnvironment): boolean => {
    // TODO: Implement
}

type EnvironmentConfig = {
    numCourses?: number,
    sessionSeriesPerCourse?: number,
    sessionsPerSeries?: number,
    questionsPerSession?: number,
    studentsPerCourse?: number,
    tasPerCourse?: number,
    profsPerCourse?: number,
    // Whether all questions are resolved
    resolvedQuestionsOnly?: boolean,
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

        // Generate session series
        for (let seriesNum = 0; seriesNum < config.sessionSeriesPerCourse; seriesNum++){
            const series = getDummySessionSeries(course.courseId, config.sessionsPerSeries);
            for (const session of series){
                const questions = [];
                // Assign TAs
                session.tas.push(...tas.map(ta => ta.userId));
                // TODO: Get dummy questions
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
        // TODO: Add everything to environment
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

export const setupQMIEnvironment = async (env : FireEnvironment) => {
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
