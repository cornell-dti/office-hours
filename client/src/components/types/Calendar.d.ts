type Session = {
    id: number,
    location: string,
    ta: string[],
    startTime: Date,
    endTime: Date
};

type SessionNode = {
    startTime: string
    endTime: string,
    building: string,
    room: string,
    sessionId: number,
    sessionSeriesId: number,
    sessionSeryBySessionSeriesId: {
        sessionSeriesTasBySessionSeriesId: {
            nodes: [TANode]
        },
        building: string,
        room: string
    },
    sessionTasBySessionId: {
        nodes: [TANode]
    },
}

type TANode = {
    userByUserId: {
        firstName: string,
        lastName: string,
        userId: number
    }
}
