import { expect } from 'chai';
import {
    cmpTimestamps,
    commitInterval, getAvgWaitTimeOneTA,
    getCurrDay,
    getEnteredByHour, getHourFromTimestamp, getQnsInQueueByHour,
    getTAsByHour
} from "../../functions/src/courseStats";
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

describe('commitInterval', function(){
    it('should work correctly', function() {
        const startTime = moment("2021-01-22T01:30-05:00").unix();
        const endTime = moment("2021-01-22T03:45-05:00").unix();
        const initArr = getZeroArray();
        const expectedArr = getZeroArray();
        expectedArr[1] = 0.5;
        expectedArr[2] = 1.0;
        expectedArr[3] = 0.75;
        commitInterval(initArr, startTime, endTime, yesterday.unix());
        expect(initArr).to.eql(expectedArr);
    });
    it('should ignore early out of bounds timings', function() {
        const startTime = moment("2021-01-21T23:30-05:00").unix();
        const endTime = moment("2021-01-22T01:30-05:00").unix();
        const initArr = getZeroArray();
        const expectedArr = getZeroArray();
        expectedArr[0] = 1.0;
        expectedArr[1] = 0.5;
        commitInterval(initArr, startTime, endTime, yesterday.unix());
        expect(initArr).to.eql(expectedArr);
    });
    it('should ignore late out of bounds timings', function(){
        const startTime = moment("2021-01-22T23:30-05:00").unix();
        const endTime = moment("2021-01-23T01:30-05:00").unix();
        const initArr = getZeroArray();
        const expectedArr = getZeroArray();
        expectedArr[23] = 0.5;
        commitInterval(initArr, startTime, endTime, yesterday.unix());
        expect(initArr).to.eql(expectedArr);
    })
});

const generateTAQuestion = (timeAssigned: string,
                            timeAddressed: string,
                            answererId : string = "guan",
                            date : string = "01-22",
                            ): FireQuestion => {
    return getDummyFireQuestion(
        answererId,
        moment(`2021-${date}T${timeAssigned}-05:00`).unix(),
        moment(`2021-${date}T${timeAssigned}-05:00`).unix(),
        moment(`2021-${date}T${timeAddressed}-05:00`).unix()
    );
}

describe('getTAsByHour', function(){
    it('should work correctly with no merges', function() {
        const tc = [
            generateTAQuestion("13:00", "13:15"),
            generateTAQuestion("14:00", "14:30"),
            generateTAQuestion("15:00", "16:00")
        ];
        const expectedArr = getZeroArray();
        expectedArr[13] = 0.25;
        expectedArr[14] = 0.5;
        expectedArr[15] = 1.0;
        expect(getTAsByHour(yesterday, tc)).to.eql(expectedArr);
    });

    it('should work correctly with merges', function() {
        const tc = [
            generateTAQuestion("13:15", "13:30"),
            generateTAQuestion("14:15", "14:25"),
            generateTAQuestion("13:00", "13:10"),
            generateTAQuestion("13:35", "13:45"),
            generateTAQuestion("14:30", "14:45")
        ];
        const expectedArr = getZeroArray();
        expectedArr[13] = 0.75;
        expectedArr[14] = 0.5;
        expect(getTAsByHour(yesterday, tc)).to.eql(expectedArr);
    });

    it('should work correctly for multiple TAs', function() {
        const tc = [
            generateTAQuestion("13:05", "13:15", "guan"),
            generateTAQuestion("14:00", "14:10", "scott"),
            generateTAQuestion("13:20", "13:30", "guan"),
            generateTAQuestion("13:35", "13:50", "guan"),
            generateTAQuestion("13:45", "13:55", "scott"),
            generateTAQuestion("14:15", "14:30", "scott")
        ];
        const expectedArr = getZeroArray();
        expectedArr[13] = 1.0; // 0.75 guan, 0.25 scott
        expectedArr[14] = 0.5; // 0.5 scott
        expect(getTAsByHour(yesterday, tc)).to.eql(expectedArr);
    });
});

const getHourFromTimestampHelper = (time: string, expectedHour: number) => {
    const startTime = moment(`2021-01-22T${time}-05:00`).unix();
    const timestamp = timeToFireTimestamp(startTime);
    expect(getHourFromTimestamp(yesterday, timestamp)).to.be.equal(expectedHour);
}

describe('getHourFromTimestamp', function(){
    it('should work correctly', function() {
        getHourFromTimestampHelper("05:15", 5);
        getHourFromTimestampHelper("23:59", 23);
        getHourFromTimestampHelper("07:23", 7);
        getHourFromTimestampHelper("00:47", 0);
    });
});

describe('getQnsInQueueByHour', function(){
   it('should work correctly', function(){
       const tc = [
           generateQuestion("13:00", "13:15"),
           generateQuestion("14:15", "14:45"),
           generateQuestion("14:30", "15:30"),
           generateQuestion("13:45", "14:15"),
           generateQuestion("17:00", "19:00")
       ];
       const expectedArr = getZeroArray();
       expectedArr[13] = 0.5;
       expectedArr[14] = 1.25;
       expectedArr[15] = 0.5;
       expectedArr[17] = 1.0;
       expectedArr[18] = 1.0;
       expect(getQnsInQueueByHour(yesterday, tc)).to.eql(expectedArr);
   });
   it('should ignore questions on other dates', function(){
       const tc = [
           generateQuestion("23:00", "23:59", "01-21"),
           generateQuestion("00:00", "00:45"),
           generateQuestion("00:00", "00:50", "01-23")
       ]
       const expectedArr = getZeroArray();
       expectedArr[0] = 0.75;
       expect(getQnsInQueueByHour(yesterday, tc)).to.eql(expectedArr);
   });
});

describe('getAvgWaitTimeOneTA', function(){
    const oneTAArr = getZeroArray();
    for (let i = 0; i < oneTAArr.length; i++){
        oneTAArr[i] = 1;
    }
    it('should work correctly for one TA on cascading questions', function(){
        const tc = [
            generateQuestion("13:00", "13:10"),
            generateQuestion("13:01", "13:21"),
            generateQuestion("13:02", "13:32"),
            generateQuestion("13:03", "13:43"),
            generateQuestion("13:04", "13:54"),
            generateQuestion("13:05", "14:05"),
            generateQuestion("13:06", "14:16")
        ];
        expect(getAvgWaitTimeOneTA(yesterday, tc, oneTAArr)).to.be.equal(600.0);
    });
    it('should work correctly for one TA on periodic questions', function(){
        const tc = [
            generateQuestion("13:09", "13:54"),
            generateQuestion("13:10", "13:20"),
            generateQuestion("13:21", "13:31"),
            generateQuestion("13:32", "13:42")
        ];
        expect(getAvgWaitTimeOneTA(yesterday, tc, oneTAArr)).to.be.equal(900.0);
    });
    it('should work correctly for one TA on more periodic questions', function(){
        const tc = [
            generateQuestion("13:00", "13:10"),
            generateQuestion("13:11", "13:21"),
            generateQuestion("13:22", "13:32"),
            generateQuestion("13:33", "13:43")
        ];
        expect(getAvgWaitTimeOneTA(yesterday, tc, oneTAArr)).to.be.equal(600.0);
    });
});
