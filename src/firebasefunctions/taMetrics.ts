import { query, where, doc, getDocs, collection, Timestamp, setDoc} from 'firebase/firestore';
import { firestore } from '../firebase';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Type to pass into ReusableBarGraph
export type BarData = {
    daysOfWeek: string;
    value: string;
    detail: string;
}

// Type to handle a specific metric, e.g. Wait Time
export type MetricData = {
    barData: BarData[];
    weeklyAvg: number;
}

// Type to handle all three metrics for analytics graphs.
export type MetricsResult = {
    waitTime: MetricData;
    timeSpent: MetricData;
    studentsHelped: MetricData;
};

// Initializes a BarData array with a BarData obj for each day of week
function initBarData(): BarData[] {
    return DAYS.map(d => ({ daysOfWeek: d, value: "0", detail: "" }));
}

// Helper to set the detail portion of a BarData
function setBarDetail(d : BarData, suffix: string) : BarData{
    d.detail = `${d.value} ${suffix}`;
    return d;
}

/**
 * Calculates TA metrics (wait time, time spent, students helped) for 
 * a given TA within a specified date range. The resulting object includes
 * weekly averages/sums, daily averages per student.
 * 
 * Wait time is defined as: minutes between `timeAssigned` - `timeEntered`
 * Time spent is defined as: minutes between `timeAddressed` - `timeAssigned`
 * Students helped is defined as: count of resolved questions
 * 
 * @param taId the unique userId of the TA
 * @param startDate start of the date range inclusive
 * @param endDate end of the date range inclusive
 * @returns a MetricsResult object containing MetricData objects for 
 *          wait time, time spent, students helped metrics. 
 *          Writes results to Firebase at a specific `weekId`
 */
export const calcTAMetrics = async(
    taId: string,
    startDate: Date,
    endDate: Date,
) : Promise<MetricsResult> => {
    // replace collections after testing
    const questionsRef = collection(firestore, "questions");

    const q = query(
        questionsRef, 
        where("answererId", "==", taId),
        where("timeEntered", ">=", Timestamp.fromDate(startDate)),
        where("timeEntered", "<=", Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);

    const waitTimeBar = initBarData();
    const timeSpentBar = initBarData();
    const studentsHelpedBar = initBarData();

    const dailyWaitTotals: Record<string, number> = {};
    const dailyWaitCounts: Record<string, number> = {};
    const dailyTimeTotals: Record<string, number> = {};
    const dailyTimeCounts: Record<string, number> = {};
    const dailyStudentsHelped: Record<string, Set<string>> = {};
    const weeklyStudentsHelped= new Set<string>();

    let totalWait = 0;
    let totalTimeSpent = 0;

    let waitCount = 0;
    let timeSpentCount = 0;
    
    snapshot.forEach(question =>{
        const data = question.data();
        const entered = data.timeEntered?.toDate();
        const assigned = data.timeAssigned?.toDate();
        const addressed = data.timeAddressed?.toDate();

        const dayName = DAYS[entered.getUTCDay()];

        if (entered && assigned && assigned > entered){
            const waitMin = (assigned.getTime() - entered.getTime()) / 1000 / 60;
            totalWait += waitMin;
            waitCount++;
            dailyWaitTotals[dayName] = (dailyWaitTotals[dayName] ?? 0) + waitMin;
            dailyWaitCounts[dayName] = (dailyWaitCounts[dayName] ?? 0) + 1;
            
        }

        if (assigned && addressed && addressed > assigned){
            const timeMin = (addressed.getTime() - assigned.getTime()) / 1000 / 60;
            totalTimeSpent += timeMin;
            timeSpentCount++;
            dailyTimeTotals[dayName] = (dailyTimeTotals[dayName] ?? 0) + timeMin;
            dailyTimeCounts[dayName] = (dailyTimeCounts[dayName] ?? 0) + 1;
        }

        if (addressed) {
            if (!dailyStudentsHelped[dayName]){
                dailyStudentsHelped[dayName] = new Set<string>();
            }
            dailyStudentsHelped[dayName].add(data.askerId);
            weeklyStudentsHelped.add(data.askerId);
        }
    });

    waitTimeBar.forEach(d => {
        const total = dailyWaitTotals[d.daysOfWeek] || 0;
        const count = dailyWaitCounts[d.daysOfWeek] || 0;
        const avg = count > 0 ? total / count : 0;
        d.value = Math.round(avg).toString();
        setBarDetail(d, `minute${d.value !== "1" ? "s":""} per student`)
    });
    timeSpentBar.forEach(d => {
        const total = dailyTimeTotals[d.daysOfWeek] || 0;
        const count = dailyTimeCounts[d.daysOfWeek] || 0;
        const avg = count > 0 ? total / count : 0;
        d.value = Math.round(avg).toString();
        setBarDetail(d, `minute${d.value !== "1" ? "s":""} per student`)
    });
    studentsHelpedBar.forEach(d => {
        const count = dailyStudentsHelped[d.daysOfWeek]?.size || 0;
        d.value = count.toString();
        setBarDetail(d, `student${d.value !== "1" ? "s":""}`)
    });

    const metrics: MetricsResult = {
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
            weeklyAvg: weeklyStudentsHelped.size,
        }
    };
    const usersRef = doc(firestore, `users/${taId}`);
    await setDoc(usersRef, { metrics }, { merge : true });
    return metrics; 
};

