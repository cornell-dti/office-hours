/**
 * randint generates a random integer between lower inclusive and upper exclusive
 * @param lower The lower range of the random number generated, inclusive
 * @param upper The upper range of the random number generated, exclusive
 */
export const randInt = (lower: number, upper: number): number => {
    const rnd = Math.random() * (upper - lower) + lower;
    return Math.floor(rnd);
}

export const randStr = (length: number): string => {
    let result = "";
    const randChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
    for (let i = 0; i < length; i++){
        const nextChar = randChars[randInt(0, randChars.length)];
        result += nextChar;
    }
    return result;
}

export const randCourseCode = (): string => {
    const courseNames = ["CS", "IS", "ECE", "MATH", "PHYS"];
    const selCourseName = courseNames[randInt(0, courseNames.length)];
    return `${selCourseName}${randInt(0, 7000)}`;
}

export const randModality = (): FireSessionModality => {
    const modalities : FireSessionModality[] = ['in-person', 'hybrid', 'virtual', 'review'];
    return randArr(modalities);
}

export const randArr = <T>(arr : T[]): T => {
    return arr[randInt(0, arr.length)];
}

export const timeToFireTimestamp = (timeSecs: number): FireTimestamp => {
    return {
        nanoseconds: 0,
        seconds: timeSecs,
        toDate(): Date {
            return new Date(timeSecs * 1000);
        }
    }
}

export const questionToSlot = (question : FireQuestion): FireQuestionSlot => {
    return {
        askerId: question.askerId,
        questionId: question.questionId,
        sessionId: question.sessionId,
        status: question.status,
        timeEntered: question.timeEntered
    };
}
