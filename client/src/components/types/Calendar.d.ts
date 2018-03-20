type Session = {
    id: number,
    location: string,
    ta: string[],
    startTime: Date,
    endTime: Date
};

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
    ta: string
}
