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

type FireCouseRole = 'professor' | 'ta' | 'student';

interface FireCourseUser {
    courseId: firebase.firestore.DocumentReference;
    userId: firebase.firestore.DocumentReference;
    role: FireCouseRole;
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
    courseId: string;
    level: number;
    tagId: string;
    name: string;
    parentTag?: firebase.firestore.DocumentReference;
}
