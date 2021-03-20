import {randStr, timeToFireTimestamp} from "../utils/utils";

// Note: Times are in unix seconds
export const getDummyFireQuestion = (
    answererId: string,
    timeEntered: number,
    timeAssigned: number | undefined = undefined,
    timeAddressed: number | undefined = undefined
): FireQuestion => {
    let status: FireQuestion["status"] = "unresolved";
    if (timeAssigned !== undefined){
        status = "assigned";
    }
    if (timeEntered !== undefined){
        status = "resolved";
    }
    return {
        answererId,
        askerId: "dummy_asker",
        content: "This is a dummy question",
        primaryTag: "dummy",
        questionId: randStr(15),
        secondaryTag: "dummy2",
        sessionId: randStr(15),
        status,
        timeAddressed: timeAddressed ? timeToFireTimestamp(timeAddressed) : undefined,
        timeAssigned: timeAssigned ? timeToFireTimestamp(timeAssigned) : undefined,
        timeEntered: timeToFireTimestamp(timeEntered)

    }
}
