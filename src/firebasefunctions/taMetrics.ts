import { query, where, doc, getDocs, collection, Timestamp, setDoc} from 'firebase/firestore';
import { firestore } from '../firebase';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type BarData = {
    daysOfWeek: string;
    value: string;
    detail: string;
}

export type MetricData = {
    barData: BarData[];
    weeklyAvg: number;
}

export type MetricsResult = {
    waitTime: MetricData;
    timeSpent: MetricData;
    studentsHelped: MetricData;
};

function initBarData(): BarData[] {
    return DAYS.map(d => ({ daysOfWeek: d, value: "0", detail: "" }));
}

function setBarDetail(d : BarData, suffix: string) : BarData{
    d.detail = `${d.value} ${suffix}`;
    return d;
}

export const calcTAMetrics = async(
    taId: string,
    startDate: Date,
    endDate: Date,
) : Promise<MetricsResult> => {
    // replace collections after testing
    const questionsRef = collection(firestore, "questions-analytics-test");

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

    let totalWait = 0;
    let totalTimeSpent = 0;
    let totalStudentsHelped = 0;

    let waitCount = 0;
    let timeSpentCount = 0;


    snapshot.forEach(question =>{
        const data = question.data();
        const entered = data.timeEntered?.toDate();
        const assigned = data.timeAssigned?.toDate();
        const addressed = data.timeAddressed?.toDate();

        const dayName = DAYS[entered.getUTCDay()];
        const dayObjWait = waitTimeBar.find(d => d.daysOfWeek === dayName);
        const dayObjTime = timeSpentBar.find(d => d.daysOfWeek === dayName);
        const dayObjStudents = studentsHelpedBar.find(d => d.daysOfWeek === dayName);
        
        if (entered && assigned && assigned > entered){
            const waitSec = (assigned.getTime() - entered.getTime()) / 1000 / 60;
            totalWait += waitSec;
            waitCount++;
            if (dayObjWait) {
                dayObjWait.value = (Number(dayObjWait.value) + waitSec).toString();
            }
        }

        if (assigned && addressed && addressed > assigned){
            const timeSec = (addressed.getTime() - assigned.getTime()) / 1000 / 60;
            totalTimeSpent += timeSec;
            timeSpentCount++;
            if (dayObjTime){
                dayObjTime.value = (Number(dayObjTime.value) + timeSec).toString();
            }
        }

        if (addressed) {
            totalStudentsHelped++;
            if(dayObjStudents){
                dayObjStudents.value = (Number(dayObjStudents.value) + 1).toString();
            }
        }
    });

    waitTimeBar.forEach(d => setBarDetail(d, "minutes per student"));
    timeSpentBar.forEach(d => setBarDetail(d, "minutes per student"));
    studentsHelpedBar.forEach(d => setBarDetail(d, `student${d.value !== "1" ? "s":""}`));

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
            weeklyAvg: totalStudentsHelped
        }
    };

    const metricsRef = doc(firestore, `users/${taId}/metrics`);
    await setDoc(metricsRef, metrics);
    return metrics; 
};

