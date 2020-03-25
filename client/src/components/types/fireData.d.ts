interface FireTimestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
}

interface FireSession {
    building: string;
    courseId: string;
    endTime: FireTimestamp;
    room: string;
    sessionSeriesId?: string;
    startTime: FireTimestamp;
    tas: string[];
    title?: string;
    sessionId: string;
}

interface FireSessionSeries {
    building: string;
    courseId: string;
    endTime: FireTimestamp;
    room: string;
    startTime: FireTimestamp;
    tas: string[];
    title?: string;
    sessionSeriesId: string;
}

/** @see FireUser for the enrollment invariant. */
interface FireCourse {
    code: string;
    endDate: FireTimestamp;
    name: string;
    queueOpenInterval: number;
    semester: string;
    startDate: FireTimestamp;
    professors: readonly string[];
    tas: readonly string[];
    courseId: string;
    charLimit: number;
    term: string;
    year: string;
}

type PrivilegedFireCourseRole = 'professor' | 'ta';
type FireCourseRole = 'professor' | 'ta' | 'student';

/**
 * Invariant for fire user and course enrollment:
 *
 * 1. Ids of all related courses of a user appear in the field `courses`.
 * 2. For each course id above
 *    - If the user's role is TA or professor, it will appear in the roles map.
 *    - Otherwise, it will not appear in the roles map. (i.e. `role == 'student'` will never appear!)
 * 3. The `roles` field are in sync with `FireCourse`'s `professors` and `tas` field
 *
 * @see FireCourse
 */
interface FireUser {
    createdAt: FireTimestamp;
    firstName: string;
    lastName: string;
    photoUrl: string;
    lastActivityAt: FireTimestamp;
    userId: string;
    email: string;
    courses: readonly string[];
    roles: { readonly [courseId: string]: PrivilegedFireCourseRole | undefined };
}

interface FireQuestion {
    askerId: string;
    answererId: string;
    content: string;
    taComment?: string;
    location: string;
    sessionId: string;
    status: 'assigned' | 'resolved' | 'retracted' | 'unresolved' | 'no-show';
    timeAddressed?: FireTimestamp;
    timeEntered: FireTimestamp;
    primaryTag: string;
    secondaryTag: string;
    questionId: string;
}

interface FireTag {
    active: boolean;
    courseId: string;
    level: number;
    tagId: string;
    name: string;
    parentTag?: string;
}
