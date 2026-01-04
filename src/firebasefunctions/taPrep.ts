/* eslint-disable no-console */
import { query, where, getDocs, collection, Timestamp, addDoc} from 'firebase/firestore';
import * as use from "@tensorflow-models/universal-sentence-encoder";
import kmeans, { KMeans } from "kmeans-ts";
import { GoogleGenAI } from "@google/genai";
import { firestore } from '../firebase';
import 'dotenv/config'; 
import { getQuestionsQuery } from '../firehooks';

/**
 * Given a list of tag ids, return a map of their id to their name.
 * @param tagIds string list of firetag ids
 * @returns 
 */
async function getTagNames(tagIds: string[]) : Promise<Map<string, string>> {
    const tagMap = new Map<string, string>();
    const tagRef = collection(firestore, "tags");

    const uniqueTagIds = Array.from(new Set(tagIds.filter(id => id)));

    const tagPromises = uniqueTagIds.map(async (tagId) => {
        try {
            const tagQuery = query(
                tagRef,
                where("__name__", "==", tagId)
            );
            const tagSnapshot = await getDocs(tagQuery);
            
            if (!tagSnapshot.empty){
                const tagDoc = tagSnapshot.docs[0];
                const data = tagDoc.data();
                return { id: tagId, name: data.name || tagId };
            }
            return { id : tagId, name: tagId };
        } catch (error) {
            console.error(`Error fetching tag ${tagId}:`, error);
            return { id: tagId, name: tagId };
        }
    });

    const tags = await Promise.all(tagPromises);
    tags.forEach(tag => tagMap.set(tag.id, tag.name));

    return tagMap;
}

/**
 * Given a course id, fetch the questions belonging to the course, 
 * the tags associated with the course, and return a list of the content, 
 * tag information, timestamps, and ids.
 * @param courseId id for the course
 * @returns 
 */
async function getQuestions( courseId: string ): Promise<QuestionData[]> {
    const questions : Array<QuestionData> = [];
    const tagIds: string[] = [];

    const q = getQuestionsQuery(courseId);
    const questionSnapshot = await getDocs(q);
    questionSnapshot.forEach(doc => {
        const data = doc.data();
        tagIds.push(data.primaryTag, data.secondaryTag);
        questions.push({
            content: data.content,
            primaryTag: data.primaryTag,
            secondaryTag: data.secondaryTag,
            timestamp: data.timeEntered,
            questionId: doc.id
        });
    });

    const tagMap = await getTagNames(tagIds);

    const result : QuestionData[] = questions.map(q => ({
        content: q.content,
        primaryTag: tagMap.get(q.primaryTag) || q.primaryTag,
        secondaryTag: tagMap.get(q.secondaryTag) || q.secondaryTag,
        timestamp: q.timestamp,
        questionId: q.questionId
    }));

    return result;
}
/**
 * `getEmbeddings` uses a typescript library for SBERT to embed each sentence 
 * in `questions` into numerical vectors represented as number[][].
 * @param questions the string list of questions that students ask
 * @returns the sentence embeddings for the list of questions.
 */
async function getEmbeddings(questions: string[]): Promise<number[][]>{
    const model = await use.load();
    const embeddings = await model.embed(questions);
    return embeddings.array();
}

/**
 * `clusterEmbeddings` uses kMeans algorithm to cluster the embedded questions into `k` clusters.
 * @param embeddings embedded vectors of question data
 * @param k number of clusters to group the data into
 * @returns obj of KMeans type including number of iterations, indexes, centroids, k.
 */
async function clusterEmbeddings(embeddings: number[][], k = 2): Promise<KMeans>{
    const clusters: KMeans = kmeans(embeddings, k);
    return clusters;
}

/**
 * Creates and returns a prompt to pass into an LLM
 * @param questions string list of question data
 * @returns prompt string
 */
function createTitlePrompt(questions: string[]){
    return `
        Given these related questions:

        Question list: "${questions}"
        What short (2-4 words) topic title describes them?
        
        Please return a JSON object with the following structure:

        {
            "title": "your title here",
        }

        Return only the JSON object, no additional text.
    `;
}

/**
 * Calls Gemini's API to create a topic title for a given cluster of related questions.
 * @param questions list of questions in a single cluster
 * @returns the topic title belonging to the cluster
 */
async function getTitles(questions: string[]) {
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
        throw new Error("LLM API KEY not found in environment");
    }

    const prompt = createTitlePrompt(questions);
    const ai = new GoogleGenAI({
        apiKey: process.env.REACT_APP_GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${prompt}`,
    });

    if (!response || !response.text) {
        throw new Error("Failed to get response from LLM");
    }
    let text = response.text.trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

    return JSON.parse(text);
    
}

/**
 * Takes the output of kmeans clustering to obtain the list of questions that belong in each cluster. 
 * @param clusters output of kmeans clustering
 * @param questions full question data list
 * @returns record containing the cluster number and its corresponding question list
 */
function groupQuestionsByCluster(clusters: KMeans, questions: string[]): Record<number, string[]> {
    const res: Record<number, string[]> = {};
    for (let i = 0; i < clusters.k; i++){
        res[i] = [];
    }

    clusters.indexes.forEach((clusterIdx, qIdx) => {
        res[clusterIdx].push(questions[qIdx]);
    });

    return res;
}

/**
 * Helper function to convert between titled clusters and question data objects.
 * @returns an array of the title and its corresponding question data object. 
 */
function clustersToQuestionData(
    clusters: TitledCluster[],
    allQuestions: QuestionData[]
): Array<{ title: string; questions: QuestionData[] }> {
    const questionMap = new Map<string, QuestionData>();
    allQuestions.forEach(q => questionMap.set(q.content, q));

    return clusters.map(cluster => ({
        title: cluster.title,
        questions: cluster.questions
            .map(content => questionMap.get(content))
            .filter((q) : q is QuestionData => q !== undefined)
    }));
}

/**
 * Performs sentence embedding, kmeans clustering, and LLM prompting to
 * obtain the values needed for the Student Trends feature in the TA Dashboard Preparation Tab.
 * Returns a list of each cluster and its questions along with a title for the cluster.
 * @param questions list of question data
 */
async function kMeansMain(questions: string[]): Promise<TitledCluster[]> {
    const res: TitledCluster[] = [];
    const embeddings = await getEmbeddings(questions);

    const k = Math.ceil(Math.sqrt(questions.length));

    const c: KMeans = await clusterEmbeddings(embeddings, k);

    const groups: Record<number, string[]> = groupQuestionsByCluster(c, questions);

    const clusterPromises = Object.entries(groups).map(async ([clusterIdx, questionsInCluster ]) => {
        try {
            const result = await getTitles(questionsInCluster) as { title: string };
            return {
                clusterIdx: Number(clusterIdx),
                data: { title: result.title, questions: questionsInCluster },
            };
        } catch (err) {
            console.error("LLM call failed:", err);
            return {
                clusterIdx: Number(clusterIdx),
                data: { title: "Untitled", questions: questionsInCluster },
            };
        } 
    });

    const clusterResults = await Promise.all(clusterPromises);

    for (const { clusterIdx, data } of clusterResults ){
        res[clusterIdx] = data;
    }

    return res;
}

/**
 * Given a list of clusters, create the TrendDocument object for each cluster. 
 * Also grabs the assignment name corresponding the the tags for that question.
 * @param clusters the list of clusters (title and question information)
 * @returns the TrendDocument[] corresponding to each cluster. 
 */
function trendsByAssignment (
    clusters: Array<{ title: string; questions: QuestionData[] }>
) : TrendDocument[] {
    const trends : TrendDocument[] = [];
    
    for (const c of clusters){
        const byAssignment = new Map<string, QuestionData[]>();

        for (const q of c.questions){
            const assignmentName = `${q.primaryTag} ${q.secondaryTag}`;
            if (!byAssignment.has(assignmentName)){
                byAssignment.set(assignmentName, []);
            }
            byAssignment.get(assignmentName)?.push(q);
        }
        const entries = Array.from(byAssignment.entries());
        entries.forEach(([assignmentName, questions]) => {
            const timestamps = questions.map(q => q.timestamp.toMillis());
            const firstMentioned = Timestamp.fromMillis(Math.min(...timestamps));
            const lastUpdated = Timestamp.fromMillis(Math.max(...timestamps));

            trends.push({
                title: c.title,
                questions: questions.map(q => ({
                    content: q.content,
                    timestamp: q.timestamp,
                    questionId: q.questionId
                })),
                volume: questions.length,
                firstMentioned,
                lastUpdated,
                assignmentName, 
                primaryTag: questions[0].primaryTag,
                secondaryTag: questions[0].secondaryTag
            });
        });
    }

    return trends;
}

/**
 * Saves list of trends to a subcollection within the course document corresopnding to the courseId. 
 * @param courseId id of the course
 * @param trends list of TrendDocuments
 */
async function saveTrends( courseId: string, trends: TrendDocument[]): Promise<void>{
    const trendsRef = collection(firestore, `courses/${courseId}/trends`);

    const p = trends.map(async (trend) => {
        try {
            await addDoc(trendsRef, trend);
        } catch (error){
            console.error(`Error adding trend ${trend.title}:`, error);
        }
    });

    await Promise.all(p);
}

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
 * Full workflow, grabs the questions from firebase, sends the content into the 
 * kMeansMain clustering algorithm + LLM titling, processes the clusters to be formatted into a 
 * TrendDocument[] and stores the TrendDocument[] to firebase. 
 * @param courseId id for the course
 */
export async function generateStudentTrends(
    courseId: string,
) : Promise<void>{
    const questions = await getQuestions(courseId);
    const questionStrings = questions.map(q => q.content);
    const clusters = await kMeansMain(questionStrings);

    const processedClusters = clustersToQuestionData(clusters, questions);

    const trends = trendsByAssignment(processedClusters);

    await saveTrends(courseId, trends);
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
        trends.push({
            title: data.title.toLowerCase(),
            volume: data.volume,
            mention: getRelativeTime(data.firstMentioned),
            assignment: data.assignmentName,
            questions: data.questions.map(q => q.content),
            firstMentioned: data.firstMentioned.toDate()
        });
    });

    return trends;
}