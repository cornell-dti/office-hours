import * as admin from 'firebase-admin';
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

export const randArr = <T>(arr: T[]): T => {
    return arr[randInt(0, arr.length)];
}

export const randTimeMins = (start: FireTimestamp, end: FireTimestamp): FireTimestamp => {
    const secsPerMin = 60;
    const durationMins = Math.floor((end.seconds - start.seconds) / secsPerMin);
    const selectedTime = start.seconds + randInt(0, durationMins) * secsPerMin;
    return new admin.firestore.Timestamp(selectedTime, 0);
}

// Precondition: tagStructure not empty, tagStructure[k] not empty forall k
// Returns: array of 2 tags containing (primary tag, secondary tag)
export const randTag = (tagStructure: Map<FireTag, FireTag[]>): FireTag[] => {
    const primaryTags = Array.from(tagStructure.keys());
    const selPrimaryTag = primaryTags[randInt(0, primaryTags.length)];
    const secondaryTags = tagStructure.get(selPrimaryTag)!;
    const selSecondaryTag = secondaryTags[randInt(0, secondaryTags.length)];
    return [selPrimaryTag, selSecondaryTag];
}

export const timeToFireTimestamp = (timeSecs: number): FireTimestamp => {
    return new admin.firestore.Timestamp(timeSecs, 0);
}

export const questionToSlot = (question: FireQuestion): FireQuestionSlot => {
    return {
        askerId: question.askerId,
        questionId: question.questionId,
        sessionId: question.sessionId,
        status: question.status,
        timeEntered: question.timeEntered
    };
}
