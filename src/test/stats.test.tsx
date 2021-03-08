import { expect } from 'chai';
import {cmpTimestamps, getCurrDay, getEnteredByHour} from "../../functions/src/courseStats";
import 'mocha';
import moment from "moment-timezone";
import {timeToFireTimestamp} from "./utils/utils";
import {getDummyFireQuestion} from "./generators/dummy";

describe('getCurrDay', function(){
    it('should return start of day', function() {
        const date = getCurrDay();
        expect(date.hours()).to.be.equal(0);
        expect(date.minute()).to.be.equal(0);
    })
});

describe('cmpTimestamps', function(){
    let earlierDate = timeToFireTimestamp(moment("2021-01-22T13:00-05:00").unix());
    let laterDate = timeToFireTimestamp(moment("2021-01-23T09:00-05:00").unix());
    let sameEarlierDate = timeToFireTimestamp(moment("2021-01-22T13:00-05:00").unix());
    it('should compare < correctly', function() {
        expect(cmpTimestamps(earlierDate, laterDate)).to.be.lessThan(0);
    });
    it('should compare > correctly', function() {
        expect(cmpTimestamps(laterDate, earlierDate)).to.be.greaterThan(0);
    })
    it('should compare == correctly', function() {
        expect(cmpTimestamps(earlierDate, sameEarlierDate)).to.be.equal(0);
    })
})

const getZeroArray = () : number[] => {
    const result = [];
    for (let i = 0; i < 24; i++){
        result.push(0);
    }
    return result;
}

const yesterday : moment.Moment = moment("2021-01-22T00:00-05:00");

const generateQuestion = (timeEntered: string,
                          timeAssigned: string | undefined = undefined,
                          date : string = "01-22",
                          answererId : string = "guan"): FireQuestion => {
    return getDummyFireQuestion(
        answererId,
        moment(`2021-${date}T${timeEntered}-05:00`).unix(),
        timeAssigned ? moment(`2021-${date}T${timeAssigned}-05:00`).unix() : undefined
    );
}

describe('getEnteredByHour', function(){
    it('should solve a simple test case', function() {
        const tc = [
            generateQuestion("13:00", "13:30"),
            generateQuestion("12:45", "13:15"),
            generateQuestion("14:45", "17:00"),
            generateQuestion("15:15", "16:00"),
            generateQuestion("13:14", "14:00"),
            generateQuestion("14:15", "16:00"),
            generateQuestion("14:59", "15:03")
        ];
        const expectedOutput = getZeroArray();
        expectedOutput[12] = 1;
        expectedOutput[13] = 2;
        expectedOutput[14] = 3;
        expectedOutput[15] = 1;
        expect(getEnteredByHour(yesterday, tc)).to.eql(expectedOutput);
    });
    it('should be ok when date out of bounds', function(){
        const tc = [
            generateQuestion("13:00", "13:30", "01-21"),
            generateQuestion("13:00", "13:30"),
            generateQuestion("13:00", "13:30", "01-23"),
            generateQuestion("13:00", "13:30"),
        ];
        const expectedOutput = getZeroArray();
        expectedOutput[13] = 2;
        expect(getEnteredByHour(yesterday, tc)).to.eql(expectedOutput);
    });
    it('should be ok with unresolved questions', function(){
        const tc = [
            generateQuestion("13:00"),
            generateQuestion("14:15"),
            generateQuestion("01:40"),
            generateQuestion("23:59"),
            generateQuestion("14:59"),
            generateQuestion("14:01")
        ];
        const expectedOutput = getZeroArray();
        expectedOutput[13] = 1;
        expectedOutput[14] = 3;
        expectedOutput[1] = 1;
        expectedOutput[23] = 1;
        expect(getEnteredByHour(yesterday, tc)).to.eql(expectedOutput);
    });
    it('should work with questions asked at 11pm', function(){
        const tc = [
            generateQuestion("13:00"),
            generateQuestion("22:00"),
            generateQuestion("23:59"),
            generateQuestion("21:59")
        ];
        const expectedOutput = getZeroArray();
        expectedOutput[13] = 1;
        expectedOutput[22] = 1;
        expectedOutput[23] = 1;
        expectedOutput[21] = 1;
        expect(getEnteredByHour(yesterday, tc)).to.eql(expectedOutput);
    });
});

