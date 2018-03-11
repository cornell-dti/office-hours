type Tag = {
    id: number,
    value: string
}

type Question = {
    id: number,
    name: string,
    value: string,
    time: number,
    tags: [Tag]
}
