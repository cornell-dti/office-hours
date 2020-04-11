export const datePlus = (date: Date, offset: number): Date => new Date(date.getTime() + offset);

export const normalizeDateToDateStart = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

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
): boolean => interval1End >= interval2Start || interval1Start >= interval2End;
