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

export const timeToFireTimestamp = (timeSecs: number): FireTimestamp => {
    return {
        nanoseconds: 0,
        seconds: timeSecs,
        toDate(): Date {
            return new Date(timeSecs * 1000);
        }
    }
}
