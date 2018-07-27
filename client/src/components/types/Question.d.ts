type Tag = {
    id: number,
    name: string,
};

type Question = {
    id: number,
    name: string,
    content: string,
    time: Date,
    tags: Tag[],
    userId: number,
    timeEntered: string
};

type QuestionNode = {
    questionId: number,
    content: string,
    userByAskerId: {
        firstName: string,
        lastName: string,
        userId: number,
    },
    timeEntered: string,
    status: string,
    questionTagsByQuestionId: {
        nodes: [{}],
    },
};

type TagNode = {
    tagId: number,
    name: string,
    activated: boolean,
    tagByTagId: {
        name: string,
    },
    questionTagsByTagId: {
        totalCount: number
    }
};
