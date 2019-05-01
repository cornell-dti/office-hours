interface FireTimestamp {
    seconds: number;
    nanoseconds: number;
}

interface FireSession {
    building: String;
    courseId: String;
    endTime: FireTimestamp;
    room: String;
    sessionSeriesId: String;
    startTime: FireTimestamp;
    title?: String;
    id: string;
}

interface FireCourse {
    code: string;
    endDate: FireTimestamp;
    name: string;
    queueOpenInterval: number;
    semester: string;
    startDate: FireTimestamp;
    id: string;
}

interface FireUser {
    createdAt: FireTimestamp;
    firstName: string;
    lastName: string;
    photoUrl: string;
    lastActivityAt: FireTimestamp;
}

interface FireQuestion {
    askerId: string,
    answererId: string,
    content: string,
    location: string,
    sessionId: string,
    status: string,
    timeAddressed: FireTimestamp,
    timeEntered: FireTimestamp
    id: string;
}

interface FireQuestionTag {
    questionId: string,
    tagId: string,
    id: string;
}

interface FireTag {
    active: boolean,
    courseId: string,
    level: number,
    id: string,
    name: string
}
