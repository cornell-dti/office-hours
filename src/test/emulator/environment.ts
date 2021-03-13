
// Helper methods for regulating QMI environments

import {initTestAdminFirebase} from "./emulfirebase";

export const satisfiesEnvironmentInvariants = (environment: FireEnvironment): boolean => {
    // TODO: Implement
}

export const generateDummyEnvironment = (
    numCourses: number,
    sessionsPerCourse: number
): FireEnvironment => {
    // TODO: Implement
}

export const setupQMIEnvironment = async (env : FireEnvironment) => {
    // TODO: Implement
    const admin = initTestAdminFirebase();
    const promises: Promise<any>[] = [];
    /*
        courses
        pendingUsers
        questionSlots
        questions
        sessions
        tags
        users
     */
    // Generate courses
    for (const course of env.courses){
        const courseRef = admin.collection("courses").doc(course.courseId);
        promises.push(courseRef.set({
            ...course,
            courseId: undefined
        }));
    }
    // Generate pending users
    for (const pendingUser of env.pendingUsers){
        const pendingRef = admin.collection("pendingUsers");
        promises.push(pendingRef.add(
            pendingUser
        ));
    }
    // TODO: Remember to generate question slots
    await Promise.all(promises);
}
