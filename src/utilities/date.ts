import moment from 'moment-timezone';

/**
 * getDateRange returns a list of dates beginning from rawStart, increasing each
 * date by 1 week until it reaches a date that is strictly later than rawEnd
 * @param rawStart The date at which the date range begins
 * @param rawEnd The date at which the date range ends
 */
export const getDateRange = (rawStart : moment.Moment, rawEnd : moment.Moment) : moment.Moment[] => {
    const start = normalizeSeconds(rawStart);
    start.tz("America/New_York");
    const end = normalizeSeconds(rawEnd);
    end.tz("America/New_York");

    const result = [];
    const currDate = moment(start);

    while (currDate.isSameOrBefore(end)){
        result.push(moment(currDate));
        currDate.add(1, 'week');
    }

    return result;
}

const normalizeSeconds = (date : moment.Moment) : moment.Moment => {
    const normalized = moment(date);
    normalized.millisecond(0);
    normalized.second(0);
    return normalized;
}

/**
 * syncTimes sets the destination to have milliseconds and seconds set to 0,
 * and have the same minutes, hours and day of week values as source
 * @param destination The date to be synced
 * @param source The date from which syncing values are derived
 */
export const syncTimes = (destination : moment.Moment, source: moment.Moment) => {
    destination.millisecond(0);
    destination.second(0);
    destination.minutes(source.minutes());
    destination.hours(source.hours());
    destination.day(source.day());
}

export const hasOverlap = (
    interval1Start: Date,
    interval1End: Date,
    interval2Start: Date,
    interval2End: Date
): boolean =>
    (interval1Start <= interval2End && interval2Start <= interval1Start) ||
    (interval1End <= interval2End && interval2Start <= interval1End);
