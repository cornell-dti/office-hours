interface FireTimestamp {
    seconds: number;
    nanoseconds: number;
    toDate(): Date;
}

type FireSessionModality = "in-person" | "hybrid" | "virtual" | "review";

interface TaAnnouncement {
    ta: FireUser;
    announcement: string;
    uploadTime: FireTimestamp;
}

interface FireBaseSession {
    modality: FireSessionModality;
    courseId: string;
    endTime: FireTimestamp;
    sessionSeriesId?: string;
    startTime: FireTimestamp;
    tas: string[];
    title?: string;
    sessionId: string;
    totalQuestions: number;
    assignedQuestions: number;
    resolvedQuestions: number;
    totalWaitTime: number;
    totalResolveTime: number;
    taAnnouncements?: TaAnnouncement[];
    isPaused?: boolean;
}

interface FireSessionLocation {
    room: string;
    building: string;
}

interface FireVirtualLocation {
    link: string;
}

interface FireVirtualSession extends FireBaseSession {
    modality: "virtual";
    useTALink?: boolean;
    TALink?: string;
}

interface FireInPersonSession extends FireBaseSession, FireSessionLocation {
    modality: "in-person";
    building: string;
    room: string;
}

interface FireHybridSession extends FireBaseSession, FireSessionLocation {
    modality: "hybrid";
    building: string;
    room: string;
    useTALink?: boolean;
    TALink?: string;
}

interface FireReviewSession extends FireBaseSession, FireVirtualLocation {
    modality: "review";
    link: string;
}

interface FireVirtualSessionProfile {
    virtualLocation?: string;
}

type FireSession = FireHybridSession | FireInPersonSession | FireVirtualSession | FireReviewSession;

/** This data is never stored in the database. */
interface FireBaseSessionSeries {
    modality: FireSessionModality;
    courseId: string;
    endTime: FireTimestamp;
    startTime: FireTimestamp;
    tas: string[];
    title?: string;
    sessionSeriesId: string;
}

interface FireVirtualSessionSeries extends FireBaseSessionSeries {
    modality: "virtual";
    useTALink?: boolean;
    TALink?: string;
}

interface FireHybridSessionSeries extends FireBaseSessionSeries, FireSessionLocation {
    modality: "hybrid";
    building: string;
    room: string;
    useTALink?: boolean;
    TALink?: string;
}

interface FireInPersonSessionSeries extends FireBaseSessionSeries, FireSessionLocation {
    modality: "in-person";
    building: string;
    room: string;
}

interface FireReviewSeries extends FireBaseSessionSeries, FireVirtualLocation {
    modality: "review";
    link: string;
}

type FireSessionSeries =
    | FireVirtualSessionSeries
    | FireHybridSessionSeries
    | FireInPersonSessionSeries
    | FireReviewSeries;
type FireSessionSeriesDefinition =
    | Omit<FireVirtualSessionSeries, "sessionSeriesId">
    | Omit<FireHybridSessionSeries, "sessionSeriesId">
    | Omit<FireInPersonSessionSeries, "sessionSeriesId">
    | Omit<FireReviewSeries, "sessionSeriesId">;

type FeedbackRecord = {
    session: string;
    questionId: string;
    organization: number?;
    efficiency: number?;
    overallExperience: number?;
    writtenFeedback: string?;
};

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
    timeLimit?: number;
    timeWarning?: number;
    isTimeLimit?: boolean; // TODO: possibly change to non-null
}

type PrivilegedFireCourseRole = "professor" | "ta";
type FireCourseRole = "professor" | "ta" | "student";

interface ResolvedItem {
    questionId: string;
    askerId: string;
}

/**
 * Invariant for fire user and course enrollment:
 *
 * 1. Ids of all related courses of a user appear in the field `courses`.
 * 2. For each course id above
 *    - If the user's role is TA or professor, it will appear in the roles map.
 *    - Otherwise, it will not appear in the roles map. (i.e. `role === 'student'` will never appear!)
 * 3. The `roles` field are in sync with `FireCourse`'s `professors` and `tas` field
 *
 * @see FireCourse
 */
//Now contains feedbackList for each user
interface FireUser {
    firstName: string;
    lastName: string;
    photoUrl: string;
    userId: string;
    email: string;
    courses: readonly string[];
    roles: { readonly [courseId: string]: PrivilegedFireCourseRole | undefined };
    phoneNumber?: string;
    textNotifsEnabled?: boolean;
    textPrompted?: boolean;
    wrapped?: boolean;
    recentlyResolvedQuestion?: ResolvedItem;
    feedbackList?: FeedbackRecord[];
}

interface FirePendingUser {
    email: string;
    roles: Record<string, role>;
}

interface FireComment {
    commentId: string;
    content: string;
    commenterId: string;
    timePosted: FireTimeStamp;
    isTA: boolean;
    askerId: string;
    answererId: string;
}

interface FireQuestion {
    askerId: string;
    answererId: string;
    content: string;
    sessionId: string;
    primaryTag: string;
    secondaryTag: string;
    questionId: string;
    status: "assigned" | "resolved" | "retracted" | "unresolved" | "no-show";
    timeEntered: FireTimestamp;
    timeAddressed?: FireTimestamp;
    timeAssigned?: FireTimestamp;
    taComment?: string;
    studentComment?: string;
    wasNotified: boolean;
    position?: number;
    isVirtual?: boolean;
    taNew?: boolean;
    studentNew?: boolean;
}

interface FireOHQuestion extends FireQuestion {
    location?: string;
    answererLocation?: string;
}

type FireQuestionSlot = Pick<FireQuestion, "askerId" | "sessionId" | "status" | "timeEntered" | "questionId">;

interface FireTag {
    active: boolean;
    courseId: string;
    level: number;
    tagId: string;
    name: string;
    parentTag?: string;
}

interface NewTag {
    id: string;
    name: string;
}

interface FireDiscussionQuestion extends FireQuestion {
    upvotedUsers: string[];
}

interface BlogPost {
    postId: string;
    title: string;
    description: string;
    listItems: string[];
    timeEntered: FireTimestamp;
    edited?: FireTimestamp;
}

interface SessionNotification {
    title: string;
    subtitle: string;
    message: string;
    createdAt: FireTimestamp;
}

interface NotificationTracker {
    id: string;
    notifications: FireTimestamp;
    productUpdates: FireTimestamp;
    notificationList: SessionNotification[];
    lastSent: FireTimestamp;
}

interface Announcement {
    text: string;
    icon: string;
    alert?: boolean;
    global?: boolean;
    noshow?: boolean;
}
