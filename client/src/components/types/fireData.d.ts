interface FireSession {
    building: String;
    courseId: String;
    endTime: number;
    room: String;
    sessionSeriesId: String;
    startTime: number;
    title?: String;
    id: string;
}

interface FireCourse {
    code: string;
    endDate: Date;
    name: string;
    queueOpenInterval: number;
    semester: string;
    startDate: Date;
    id: string;
}

interface FireUser {
    createdAt: number;
    firstName: string;
    lastName: string;
    photoUrl: string;
    lastActivityAt: number;
}
