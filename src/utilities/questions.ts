export const filterUnresolvedQuestions = (
    allQuestions: readonly FireQuestion[]
): readonly FireQuestion[] =>
    allQuestions.filter(({ status }) => status === 'assigned' || status === 'unresolved');

export const filterAndpartitionQuestions = (
    allQuestions: readonly FireQuestion[],
    userId: string
): readonly [readonly FireQuestion[], readonly FireQuestion[]] => {
    const unresolvedQuestions = filterUnresolvedQuestions(allQuestions);
    const userQuestions = unresolvedQuestions.filter(question => question.askerId === userId);

    return [unresolvedQuestions, userQuestions];
};

export const computeNumberAheadFromFilterAndpartitionQuestions = (
    unresolvedQuestions: readonly FireQuestion[],
    userQuestions: readonly FireQuestion[]
): number => {
    if (userQuestions.length === 0) {
        return unresolvedQuestions.length;
    }
    return (
        unresolvedQuestions.filter(
            question => question.timeEntered.toDate() <= userQuestions[0].timeEntered.toDate()
        ).length - 1
    );
};

export const computeNumberAhead = (allQuestions: readonly FireQuestion[], userId: string): number =>
    computeNumberAheadFromFilterAndpartitionQuestions(
        ...filterAndpartitionQuestions(allQuestions, userId)
    );
