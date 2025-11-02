/* eslint-disable no-console */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function initBarData() {
    return DAYS.map(d => ({ daysOfWeek: d, value: "0", detail: "" }));
}

function setBarDetail(d, suffix) {
    d.detail = `${d.value} ${suffix}`;
    return d;
}

// Sample questions
const questions = [
    {
        answererId: "wErsI9HIYeNaOi5uRzEVcgZbIl93",
        askerId: "suwtgspB5FcHXjS32w3GIzP5Vaq2",
        timeEntered: new Date("2025-10-04T09:00:00-04:00"),
        timeAssigned: new Date("2025-10-04T09:05:00-04:00"),
        timeAddressed: new Date("2025-10-04T09:20:00-04:00"),
    },
    {
        answererId: "wErsI9HIYeNaOi5uRzEVcgZbIl93",
        askerId: "P6yJ1adHZjfpY0hRbb9w1PiRzSr2",
        timeEntered: new Date("2025-10-03T09:30:00-04:00"),
        timeAssigned: new Date("2025-10-03T09:32:00-04:00"),
        timeAddressed: new Date("2025-10-03T09:40:00-04:00"),
    },
    {
        answererId: "wErsI9HIYeNaOi5uRzEVcgZbIl93",
        askerId: "J53D6pOwqwZNW7Nyqte1b0Sp6Vt1",
        timeEntered: new Date("2025-10-04T10:00:00-04:00"),
        timeAssigned: new Date("2025-10-04T10:10:00-04:00"),
        timeAddressed: new Date("2025-10-04T10:15:00-04:00"),
    },
    {
        answererId: "wErsI9HIYeNaOi5uRzEVcgZbIl93",
        askerId: "kl6nplEPKBelGSXvd2AC36niXdK2",
        timeEntered: new Date("2025-10-02T15:50:20-04:00"),
        timeAssigned: new Date("2025-10-02T16:04:35-04:00"),
        timeAddressed: new Date("2025-10-02T16:14:05-04:00"),
    },
];

function calcTAMetricsLocal(taId, startDate, endDate) {
    const waitTimeBar = initBarData();
    const timeSpentBar = initBarData();
    const studentsHelpedBar = initBarData();

    const dailyWaitTotals = {};
    const dailyWaitCounts = {};
    const dailyTimeTotals = {};
    const dailyTimeCounts = {};
    const dailyStudentsHelped = {};
    const weeklyStudentsHelped = new Set();

    let totalWait = 0;
    let totalTimeSpent = 0;
    let waitCount = 0;
    let timeSpentCount = 0;

    const filtered = questions.filter(q =>
        q.answererId === taId &&
        q.timeEntered >= startDate &&
        q.timeEntered <= endDate
    );

    filtered.forEach(q => {
        const { timeEntered, timeAssigned, timeAddressed, askerId } = q;
        if (!timeEntered) return;
        const dayName = DAYS[timeEntered.getUTCDay()];

        // Wait time per question
        if (timeAssigned && timeAssigned > timeEntered) {
            const waitMin = (timeAssigned - timeEntered) / 1000 / 60;
            totalWait += waitMin;
            waitCount++;
            dailyWaitTotals[dayName] = (dailyWaitTotals[dayName] || 0) + waitMin;
            dailyWaitCounts[dayName] = (dailyWaitCounts[dayName] || 0) + 1;
        }

        // Time spent per question
        if (timeAssigned && timeAddressed && timeAddressed > timeAssigned) {
            const spentMin = (timeAddressed - timeAssigned) / 1000 / 60;
            totalTimeSpent += spentMin;
            timeSpentCount++;
            dailyTimeTotals[dayName] = (dailyTimeTotals[dayName] || 0) + spentMin;
            dailyTimeCounts[dayName] = (dailyTimeCounts[dayName] || 0) + 1;
        }

        // Students helped (unique per day)
        if (timeAddressed) {
            if (!dailyStudentsHelped[dayName]) dailyStudentsHelped[dayName] = new Set();
            dailyStudentsHelped[dayName].add(askerId);
            weeklyStudentsHelped.add(askerId);
        }
    });

    // Build bar values
    waitTimeBar.forEach(d => {
        const total = dailyWaitTotals[d.daysOfWeek] || 0;
        const count = dailyWaitCounts[d.daysOfWeek] || 0;
        const avg = count > 0 ? Math.round(total / count) : 0;
        d.value = avg.toString();
        setBarDetail(d, `minute${avg !== 1 ? "s" : ""} per student`);
    });

    timeSpentBar.forEach(d => {
        const total = dailyTimeTotals[d.daysOfWeek] || 0;
        const count = dailyTimeCounts[d.daysOfWeek] || 0;
        const avg = count > 0 ? Math.round(total / count) : 0;
        d.value = avg.toString();
        setBarDetail(d, `minute${avg !== 1 ? "s" : ""} per student`);
    });

    studentsHelpedBar.forEach(d => {
        const count = dailyStudentsHelped[d.daysOfWeek]?.size || 0;
        d.value = count.toString();
        setBarDetail(d, `student${count !== 1 ? "s" : ""}`);
    });

    return {
        waitTime: {
            barData: waitTimeBar,
            weeklyAvg: waitCount > 0 ? Math.round(totalWait / waitCount) : 0
        },
        timeSpent: {
            barData: timeSpentBar,
            weeklyAvg: timeSpentCount > 0 ? Math.round(totalTimeSpent / timeSpentCount) : 0
        },
        studentsHelped: {
            barData: studentsHelpedBar,
            weeklyAvg: weeklyStudentsHelped.size
        }
    };
}

// Dry-run
const startDate = new Date("2025-09-29T00:00:00Z");
const endDate = new Date("2025-10-05T23:59:59Z");
const result = calcTAMetricsLocal("wErsI9HIYeNaOi5uRzEVcgZbIl93", startDate, endDate);

console.log("Local dry-run metrics:\n", JSON.stringify(result, null, 2));
