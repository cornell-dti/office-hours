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
};

type QuestionNode = {
    questionId: number,
    content: string,
    userByAskerId: {
        firstName: string,
        lastName: string,
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
    },
};
