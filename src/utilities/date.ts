export const datePlus = (date: Date, offset: number): Date => {
    return new Date(date.getTime() + offset)
};

/** Gets time at the beginning of the day */
export const normalizeDateToDateStart = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

/** Gets time at the beginning of the week */
export const normalizeDateToWeekStart = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    normalized.setDate(normalized.getDate() - normalized.getDay());
    return normalized;
};

export const hasOverlap = (
    interval1Start: Date,
    interval1End: Date,
    interval2Start: Date,
    interval2End: Date
): boolean =>
    (interval1Start <= interval2End && interval2Start <= interval1Start) ||
    (interval1End <= interval2End && interval2Start <= interval1End);
