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
    id: string;
}

interface FireCourse {
    code: string;
    endDate: FireTimestamp;
    name: string;
    queueOpenInterval: number;
    semester: string;
    startDate: FireTimestamp;
    courseId: string;
}

interface FireCourseUser {
    courseId: {
        path: string;
    };
    userId: string;
    role: string;
    couresUserId: string;
}

interface FireUser {
    createdAt: FireTimestamp;
    firstName: string;
    lastName: string;
    photoUrl: string;
    lastActivityAt: FireTimestamp;
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
    secondaryTAg: string;
    id: string;
}

interface FireTag {
    active: boolean;
    courseId: string;
    level: number;
    id: string;
    name: string;
}
