interface AppCourse {
    code: string;
    name: string;
}

interface AppSession {
    sessionId: number;
    startTime: Date;
    endTime: Date;
    building: string;
    room: string;
    questionsBySessionId: {
        nodes: [AppQuestion]
    }
    sessionTasBySessionId: {
        nodes: [AppTa]
    }
}

interface AppTa {
    userByUserId: {
        firstName: string;
        lastName: string;
        photoUrl: string;
    }
}

interface AppQuestion {
    questionId: number;
    content: string;
    status: string;
    timeEntered: Date;
    userByAskerId: AppUser;
    questionTagsByQuestionId: {
        nodes: [AppTag]
    }
}

interface AppTag {
    tagByTagId: {
        name: string;
        level: number;
    }
}

interface AppUser {
    firstName: string;
    lastName: string;
    photoUrl: string;
    userId: number;
}

interface CurrentUserRole {
    nodes: [{
        courseUsersByUserId: {
            nodes: [{
                role: string;
                userId: number;
            }]
        }
    }]
}
