interface AppData {
    courseByCourseId: {
        code: string;
        name: string;
    };
    apiGetSessions: {
        nodes: [AppSession];
    };
}

interface AppSession {
    sessionId: number;
    startTime: Date;
    endTime: Date;
    building: string;
    room: string;
    questionsBySessionId: {
        nodes: [{
            questionId: number;
            content: string;
            status: string;
            timeEntered: Date;
            userByAskerId: {
                firstName: string;
                lastName: string;
                photoUrl: string;
            }
            questionTagsByQuestioId: {
                nodes: [{
                    tagByTagId: {
                        name: string;
                        level: number;
                    }
                }]
            }
        }]
    }
    sessionTasBySessionId: {
        nodes: [{
            userByUserId: {
                firstName: string;
                lastName: string;
                photoUrl: string;
            }
        }]
    }
}
