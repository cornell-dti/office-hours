import {randArr, randCourseCode, randInt, randStr, randTag, randTimeMins, timeToFireTimestamp} from "../utils/utils";
import moment from "moment-timezone";

// Note: Times are in unix seconds
// This is for testing properties of questions and statistics
export const getDummyFireQuestion = (
    answererId: string,
    timeEntered: number,
    timeAssigned: number | undefined = undefined,
    timeAddressed: number | undefined = undefined,
    sessionId: string,
): FireQuestion => {
    let status: FireQuestion["status"] = "unresolved";
    if (timeAssigned !== undefined){
        status = "assigned";
    }
    if (timeEntered !== undefined){
        status = "resolved";
    }
    return {
        answererId,
        askerId: "dummy_asker",
        content: "This is a dummy question",
        primaryTag: "dummy",
        questionId: randStr(15),
        secondaryTag: "dummy2",
        sessionId,
        status,
        timeAddressed: timeAddressed ? timeToFireTimestamp(timeAddressed) : undefined,
        timeAssigned: timeAssigned ? timeToFireTimestamp(timeAssigned) : undefined,
        timeEntered: timeToFireTimestamp(timeEntered)
    }
}

// This is to generate actual questions that satisfy constraints
// Precondition: primaryTag must be the parent of secondaryTag
// Precondition: students must be non empty
export const getDummyQuestionForSession = (
    session: FireSession,
    tas: FireUser[],
    students: FireUser[],
    status: FireQuestion["status"],
    tagStructure: Map<FireTag, FireTag[]>
): FireQuestion => {
    const asker = randArr(students).userId;
    const answerer = tas === [] ? "" : randArr(tas).userId;
    const randTags = randTag(tagStructure);
    // Get a pair of random tags
    const primaryTag = randTags[0];
    const secondaryTag = randTags[1];
    const timeEntered = randTimeMins(session.startTime, session.endTime);
    const timeEnteredMoment = moment.unix(timeEntered.seconds);
    const timeAssignedMoment = moment(timeEnteredMoment).add(randInt(0, 60), 'minutes');
    const timeAddressedMoment = moment(timeAssignedMoment).add(randInt(10, 40), 'minutes');
    const question: FireQuestion = {
        answererId: answerer,
        askerId: asker,
        content: randStr(100) + "?",
        primaryTag: primaryTag.tagId,
        questionId: randStr(15),
        secondaryTag: secondaryTag.tagId,
        sessionId: session.sessionId,
        status: randArr<FireQuestion["status"]>(['assigned', 'resolved', 'retracted', 'unresolved', 'no-show']),
        timeAddressed: timeToFireTimestamp(timeAddressedMoment.unix()),
        timeAssigned: timeToFireTimestamp(timeAssignedMoment.unix()),
        timeEntered: timeEntered
    };

    // Construct state based on status
    if (status === "unresolved"){
        question.timeAssigned = undefined;
        question.timeAddressed = undefined;
    } else if (status === "retracted"){
        question.timeAddressed = undefined;
        question.timeAssigned = undefined;
    } else if (status === "assigned"){
        question.timeAddressed = undefined;
    }
    // Other statuses have everything
    question.status = status;
    question.primaryTag = primaryTag.tagId;
    question.secondaryTag = secondaryTag.tagId;
    return question;
}

export const getDummyCourse = (
    startDate : FireTimestamp = timeToFireTimestamp(moment().subtract(3, 'months').unix()),
    endDate: FireTimestamp = timeToFireTimestamp(moment().add(3, 'months').unix()),
    name : string = randArr(["Functional Programming", "Object Oriented Programming", "Algorithms",
        "Intro to Python", "Intro to Matlab", "Machine Learning", "Computer Vision", "Compilers",
        "Software Engineering", "Intro to App Development", "Intro to Web Development"])
) : FireEditableCourse => {
    return {
        // Not sure what this does
        charLimit: 140,
        code: randCourseCode(),
        courseId: randStr(15),
        endDate,
        name,
        professors: [],
        queueOpenInterval: 30,
        semester: "SP",
        startDate,
        tas: [],
        term: "SP",
        year: moment().year().toString()
    }
}

export const getDummyTag = (
    parentTag: string | null,
    courseId: string,
    active: boolean = true,
) : FireTag => {
    let tagName = `${randArr(["A", "HW", "PA", "Problem Set"])} ${randInt(0, 10)}`;
    if (parentTag !== null){
        tagName = randArr(["General", "Debugging", "Conceptual", "Programming Language", "Clarification"]);
    }
    return {
        active,
        courseId,
        level: parentTag === null ? 1 : 2,
        name: tagName,
        tagId: randStr(15),
        parentTag: parentTag === null ? undefined : parentTag
    };
}

export const getDummyTags = (
    course : FireCourse,
    tagStructure: Map<String, String[]>
) : FireTag[] => {
    const result : FireTag[] = [];
    const courseId = course.courseId;
    tagStructure.forEach((secondaryTags, primaryTag) => {
        // Generate parent tag
        const parentTag = getDummyTag(null, courseId);
        result.push(parentTag);
        secondaryTags.forEach((secondaryTag) => {
           result.push(getDummyTag(parentTag.tagId, courseId));
        });
    });
    return result;
}

export const getDummyEditableUser = () : FireEditableUser => {
    return {
        courses: [],
        email: `${randStr(15)}@gmail.com`,
        firstName: randStr(10),
        lastName: randStr(randInt(2, 5)),
        photoUrl: `https://placekitten.com/${randInt(100, 200)}/${randInt(100, 200)}`,
        roles: {},
        userId: randStr(15)
    }
}

export const getDummyUser = (
    firstName: string,
    lastName: string,
    courses: readonly string[],
    roles: { readonly [courseId: string]: PrivilegedFireCourseRole | undefined }
) : FireEditableUser => {
    return {
        courses: [],
        email: "hello@cornelldti.org",
        firstName,
        lastName,
        photoUrl: "https://placekitten.com/200/200",
        roles,
        userId: randStr(15)
    }
}

export const addUsersToCourse = (
    course: FireEditableCourse,
    users: FireEditableUser[],
    role: FireCourseRole
) => {
    const userIds = users.map(user => user.userId);
    if (role === "professor"){
        for (const user of users){
            user.courses.push(course.courseId);
            user.roles[course.courseId] = "professor";
        }
        course.professors.push(...userIds);
    } else if (role === "ta"){
        for (const user of users){
            user.courses.push(course.courseId);
            user.roles[course.courseId] = "ta";
        }
        course.tas.push(...userIds);
    } else {
        for (const user of users){
            user.courses.push(course.courseId);
        }
    }
}

export const getDummyPendingUserByCourses = (
    email: string,
    taCourses: FireCourse[],
    profCourses: FireCourse[]
) : FirePendingUser => {
    const roles: Record<string, PrivilegedFireCourseRole> = {};
    for (const taCourse of taCourses){
        roles[taCourse.courseId] = "ta";
    }
    for (const profCourse of profCourses){
        roles[profCourse.courseId] = "professor";
    }
    return {
        email,
        roles
    }
}

// Precondition: layer one and layer two min must be at least 1
export const getDummyTagStructure = (
    layerOne: number,
    layerTwoMin: number,
    layerTwoMax: number
): Map<FireTag, FireTag[]> => {
    // TODO: Implement
}
