type Session = {
    id: number,
    location: string,
    ta: string[],
    startTime: Date,
    endTime: Date
};

type SessionNode = {
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
    startTime: string
}

type TANode = {
    userByUserId: {
        firstName: string,
        lastName: string,
    }
}
