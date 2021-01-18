import moment from 'moment-timezone';

export const datePlusWithDST = (date: Date, offsetInSecs: number): Date => {
    const currentOffset = utcOffsetOfDate(date);

    const futureOffset = utcOffsetOfDate(date, offsetInSecs)

    const offsetDiffSecs = (futureOffset - currentOffset) * 3600;
    return new Date(date.getTime() + offsetInSecs + offsetDiffSecs);
};

export const utcOffsetOfDate = (date: Date, offset = 0) => {
    const zone = moment.tz.zone('America/New_York')!;
    return zone.offset((date.getTime() + offset)/1000);
}

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
