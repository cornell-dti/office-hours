// RYAN_TODO represent different ID's as opaque types

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
    sessionSeriesId: string;
    startTime: FireTimestamp;
    title?: string;
    sessionId: string;
}

interface FireCourse {
    code: string;
    endDate: FireTimestamp;
    name: string;
    queueOpenInterval: number;
    semester: string;
    startDate: FireTimestamp;
    courseId: string;
    charLimit: number;
}

interface FireCourseUser {
    courseId: {
        path: string;
    };
    userId: string;
    role: 'professor' | 'ta' | 'student';
    couresUserId: string;
}

interface FireUser {
    createdAt: FireTimestamp;
    firstName: string;
    lastName: string;
    photoUrl: string;
    lastActivityAt: FireTimestamp;
    userId: string;
}

interface FireQuestion {
    askerId: string;
    answererId: string;
    content: string;
    location: string;
    sessionId: string;
    status: string;
    timeAddressed: FireTimestamp;
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
    parentTag?: firebase.firestore.DocumentReference;
}
