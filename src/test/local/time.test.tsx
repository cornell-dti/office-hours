import { expect } from 'chai';
import 'mocha';
import moment from 'moment-timezone';
import { getDateRange } from '../../utilities/date';


const assertDateRangeValid = (range: moment.Moment[]) => {
    if (range.length === 0){
        return;
    }
    const firstDay = range[0].day();
    const firstHour = range[0].hour();
    const firstMinute = range[0].minutes();

    let prevDate: moment.Moment | null = null;
    range.forEach( (date) => {
        expect(date.day()).to.equal(firstDay);
        expect(date.hour()).to.equal(firstHour);
        expect(date.minute()).to.equal(firstMinute);

        if (prevDate !== null){
            expect(date.diff(prevDate, "days")).to.equal(7);
        }

        prevDate = date;
    })
}

describe('Date range makes sense', function() {
    it('should be valid without daylight saving', function() {
        const startDate = moment("2021-01-22T13:00-05:00");
        const endDate = moment("2021-02-05T13:00-05:00");
        const range = getDateRange(startDate, endDate);
        expect(range.length).to.equal(3);
        assertDateRangeValid(range);
    });

    it('should be valid with daylight saving', function() {
        const startDate = moment("2021-03-08T13:00-05:00");
        const endDate = moment("2021-04-07T13:00-05:00");
        const range = getDateRange(startDate, endDate);
        expect(range.length).to.equal(5);
        assertDateRangeValid(range);
    });

});
