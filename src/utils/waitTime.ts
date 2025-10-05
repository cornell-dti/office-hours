import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { getQuestionsQuery } from '../firehooks';
import { firestore } from '../firebase';

type BarRow = { dayOfWeek: string } & { [hourLabel: string]: number };

const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const buildHourLabels = (): string[] => {
    const labels: string[] = [];
    for (let hour = 7; hour <= 23; hour++) {
        const isPm = hour >= 12;
        const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        labels.push(`${h12}${isPm ? 'pm' : 'am'}`);
    }
    return labels;
};

const HOUR_LABELS = buildHourLabels();

export type WaitTimeGraphData = {
    barData: BarRow[];
    timeKeys: string[];
    yMax: number;
    legend: string;
    OHDetails: { [id: string]: { ta: string; location: string; startHour: string; endHour: string; avgWaitTime: string } };
    debug?: {
        sessionIds: string[];
        scheduledDays: string[];
        questionCount: number;
    };
};

export const buildWaitTimeData = async (courseId: string, lookbackDays = 56): Promise<WaitTimeGraphData> => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - lookbackDays);

    // Reuse existing helper that scopes to the courseId
    const base = getQuestionsQuery(courseId);
    const q = query(
        base,
        where('status', '==', 'resolved'),
        where('timeEntered', '>=', Timestamp.fromDate(start))
    );

    const snap = await getDocs(q);

    // Also determine which days actually have scheduled office hours by
    // checking the sessions for this course
    const sessionsSnap = await getDocs(
        query(collection(firestore, 'sessions'), where('courseId', '==', courseId))
    );
    const scheduledDays = new Set<string>();
    const sessionIdsForDebug: string[] = [];
    sessionsSnap.docs.forEach((d) => {
        const sd = d.data() as any;
        if (!sd?.startTime) return;
        const dt = sd.startTime.toDate() as Date;
        const day = DAY_NAMES[dt.getDay()];
        scheduledDays.add(day);
        sessionIdsForDebug.push(d.id);
    });

    const buckets = new Map<string, number[]>();

    for (const docu of snap.docs) {
        const qd = docu.data() as any;
        if (!qd?.timeEntered || !qd?.timeAssigned) continue;

        const entered: Date = qd.timeEntered.toDate();
        const day = DAY_NAMES[entered.getDay()];
        const hour = entered.getHours();
        if (hour < 7 || hour > 23) continue;

        const label = (() => {
            const isPm = hour >= 12;
            const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${h12}${isPm ? 'pm' : 'am'}`;
        })();

        const waitSeconds = (qd.timeAssigned.seconds - qd.timeEntered.seconds) / (qd.position || 1);
        const waitMinutes = waitSeconds / 60;

        const key = `${day}__${label}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(waitMinutes);
    }

    const rows: BarRow[] = Array.from(scheduledDays).sort((a, b) => {
        const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return order.indexOf(a) - order.indexOf(b);
    }).map((d) => {
        const row: any = { dayOfWeek: d };
        HOUR_LABELS.forEach((h) => (row[h] = 0));
        return row as BarRow;
    });

    let maxVal = 0;
    for (const [key, arr] of buckets.entries()) {
        const [day, label] = key.split('__');
        const row = rows.find((r) => r.dayOfWeek === day);
        if (!row) continue;
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        const rounded = Math.round(avg);
        row[label] = rounded;
        if (rounded > maxVal) maxVal = rounded;
    }

    const yMax = Math.max(5, Math.ceil(maxVal / 5) * 5);

    return {
        barData: rows,
        timeKeys: HOUR_LABELS,
        yMax,
        legend: 'Avg minutes per student',
        OHDetails: {},
        debug: undefined,
    };
};

/**
 * Seed a lightweight test session for the given courseId, for today.
 * Dev-only helper.
 */
export const seedTestSession = async (courseId: string) => {
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const payload: any = {
        modality: 'in-person',
        building: 'TestBldg',
        room: '101',
        courseId,
        startTime: Timestamp.fromDate(now),
        endTime: Timestamp.fromDate(end),
        tas: [],
        title: 'Test Session',
        totalQuestions: 0,
        assignedQuestions: 0,
        resolvedQuestions: 0,
        totalWaitTime: 0,
        totalResolveTime: 0,
        isPaused: false,
    };
    const ref = await (await import('firebase/firestore')).addDoc(
        collection(firestore, 'sessions'),
        payload
    );
    // eslint-disable-next-line no-console
    console.log('[waitTime] seeded test session id:', ref.id);
    return ref.id;
};

/**
 * Seed a minimal resolved question for testing aggregation.
 * It will attach to the given courseId and set timeEntered/timeAssigned around 'now'.
 */
export const seedTestResolvedQuestion = async (
    courseId: string,
    minutesWait = 10,
    position = 1
) => {
    const now = new Date();
    const entered = new Date(now.getTime() - minutesWait * 60 * 1000);
    const payload: any = {
        askerId: 'test-asker',
        answererId: 'test-ta',
        content: 'Test question',
        sessionId: 'test-session',
        courseId,
        primaryTag: '',
        secondaryTag: '',
        status: 'resolved',
        timeEntered: Timestamp.fromDate(entered),
        timeAssigned: Timestamp.fromDate(now),
        timeAddressed: Timestamp.fromDate(now),
        wasNotified: false,
        position,
    };
    const ref = await (await import('firebase/firestore')).addDoc(
        collection(firestore, 'questions'),
        payload
    );
    // eslint-disable-next-line no-console
    console.log('[waitTime] seeded test question id:', ref.id);
    return ref.id;
};

/**
 * Return whether there is at least one session on the given date for a course.
 * Date comparison is done with [startOfDay, startOfNextDay) in local time.
 */
export const hasSessionsOnDate = async (courseId: string, date: Date): Promise<boolean> => {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
    const snap = await getDocs(
        query(
            collection(firestore, 'sessions'),
            where('courseId', '==', courseId),
            where('startTime', '>=', Timestamp.fromDate(start)),
            where('startTime', '<', Timestamp.fromDate(end))
        )
    );
    return snap.size > 0;
};


