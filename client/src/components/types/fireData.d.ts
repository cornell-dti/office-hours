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
}

type FireCourseRole = 'professor' | 'ta' | 'student';

interface FireCourseUser {
    courseId: string;
    userId: string;
    role: FireCourseRole;
    courseUserId: string;
}

interface FireUser {
    createdAt: FireTimestamp;
    firstName: string;
    lastName: string;
    photoUrl: string;
    lastActivityAt: FireTimestamp;
    userId: string;
    email: string;
}

interface FireQuestion {
    askerId: firebase.firestore.DocumentReference;
    answererId: firebase.firestore.DocumentReference;
    content: string;
    location: string;
    sessionId: firebase.firestore.DocumentReference;
    status: 'assigned' | 'resolved' | 'retracted' | 'unresolved';
    timeAddressed: FireTimestamp;
    timeEntered: FireTimestamp;
    primaryTag: firebase.firestore.DocumentReference;
    secondaryTag: firebase.firestore.DocumentReference;
    questionId: string;
}

interface FireTag {
    active: boolean;
    courseId: firebase.firestore.DocumentReference;
    level: number;
    tagId: string;
    name: string;
    parentTag?: firebase.firestore.DocumentReference;
}
