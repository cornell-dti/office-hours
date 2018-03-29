type Session = {
    id: number,
    location: string,
    ta: string[],
    startTime: Date,
    endTime: Date
};

type SessionNode = {
    endTime: Date,
    location: string,
    sessionId: number
    sessionSeryBySessionSeriesId: {
        sessionSeriesTasBySessionSeriesId: {
            nodes: [TANode]
        },
        location: string,
    },
    sessionTasBySessionId: {
        nodes: [TANode]
    },
    startTime: Date
}

type TANode = {
    userByUserId: {
        firstName: string,
        lastName: string,
    }
}
