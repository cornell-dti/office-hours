type Tag = {
    id: number,
    name: string,
    level: number,
};

type Question = {
    id: number,
    name: string,
    content: string,
    time: Date,
    tags: Tag[],
    userId: number,
    timeEntered: string,
    photoUrl: string
};

type QuestionNode = {
    questionId: number,
    content: string,
    userByAskerId: {
        firstName: string,
        lastName: string,
        userId: number,
        photoUrl: string
    },
    timeEntered: string,
    status: string,
    questionTagsByQuestionId: {
        nodes: [{}],
    },
};

type TagNode = {
    tagId: number,
    tagByTagId: {
        name: string,
        level: number,
    },
};
