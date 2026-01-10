/* eslint-disable no-console */
import { getDocs, collection, Timestamp} from 'firebase/firestore';
import { firestore } from '../firebase';

/**
 * Helper function to convert a timestamp to a string describing the relative time to "now".
 */
function getRelativeTime(timestamp: Timestamp) : string {
    const now = Date.now();
    const then = timestamp.toMillis();
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
}

/**
 * Hook for frontend component. Fetches the trend documents from firebase from the trends subcollection
 * associated with the course document corresponding to `courseId`. Formats it into a TrendData[] object for 
 * frontend use. 
 * @param courseId id for the course
 * @returns 
 */
export async function getStudentTrends(courseId: string) : Promise<TrendData[]>{
    const trendsRef = collection(firestore, `courses/${courseId}/trends`);
    const snapshot = await getDocs(trendsRef);

    const trends : TrendData[] = [];
    snapshot.forEach(doc => {
        const data = doc.data() as TrendDocument;
        const time:Timestamp = data.firstMentioned;
        trends.push({
            title: data.title.toLowerCase(),
            volume: data.volume,
            mention: getRelativeTime(data.firstMentioned),
            assignment: data.assignmentName,
            questions: data.questions.map(q => q.content),
            firstMentioned: time.toDate()
        });
    });

    return trends;
}