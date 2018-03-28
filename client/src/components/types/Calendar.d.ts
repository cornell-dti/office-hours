type Session = {
    id: number,
    location: string,
    ta: string[],
    startTime: Date,
    endTime: Date
};

type SessionSeriesNode = {
    sessionsBySessionSeriesId: {
        nodes: [{}],
    },
    sessionSeriesTasBySessionSeriesId: {
        nodes: [{}]
    }
}

type SessionNode = {
    sessionId: number,
    location: string,
    startTime: string,
    endTime: string,
    timeEntered: string,
    sessionTasBySessionId: {
        nodes: [{}],
    },
};

type TANode = {
    userByUserId: {
        firstName: string,
        lastName: string,
    }
}
