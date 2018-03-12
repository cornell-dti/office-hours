type Tag = {
    id: number,
    value: string
}

type Question = {
    id: number,
    name: string,
    value: string,
    time: number,
    tags: Tag[]
}

type QuestionNode = {
    questionId: number,
    value: string,
    student: string,
    questionTagsByQuestionId: {
        nodes: [{}]
    }
}

type TagNode = {
    tagId: number,
    tagByTagId: {
        courseId: number,
        value: string
    }
}
