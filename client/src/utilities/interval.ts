export class Interval {

    static toMillisecoonds(interval: AppInterval | null) {
        if (interval) {
            return 1000 * (
                interval.years * 31556926 +
                interval.months * 2629743 +
                interval.days * 86400 +
                interval.hours * 3600 +
                interval.minutes * 60 +
                interval.seconds
            );
        }
        return 0;
    }

}
