type Session = {
    id: number,
    location: string,
    ta: string[],
    startTime: Date,
    endTime: Date
};

type SessionNode = {
    endTime: Date,
    building: string,
    room: string,
    sessionId: number
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
    startTime: Date
}

type TANode = {
    userByUserId: {
        firstName: string,
        lastName: string,
    }
}
