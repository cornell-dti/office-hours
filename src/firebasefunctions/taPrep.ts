/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { query, where, doc, getDocs, collection, Timestamp, setDoc} from 'firebase/firestore';
import { pipeline } from "@huggingface/transformers";
import { DBSCAN } from "density-clustering";
import kmeans, { KMeans } from "kmeans-ts";
import { GoogleGenAI } from "@google/genai";
import { firestore } from '../firebase';
import 'dotenv/config'; 
import { oberlinData } from './oberlinData';
import { dummyData } from './dummyData';

/**
 * `getEmbeddings` uses a typescript library for SBERT to embed each sentence 
 * in `questions` into numerical vectors represented as number[][].
 * @param questions the string list of questions that students ask
 * @returns the sentence embeddings for the list of questions.
 */
async function getEmbeddings(questions: string[]): Promise<number[][]>{
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(questions, { pooling: 'mean', normalize: true });
    return output.tolist();
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
 * `dbscanClustering` uses DBSCAN algorithm to cluster the embedded questions.
 * @param embeddings embedded vectors of question data
 * @param epsilon the max distance between 2 pts to be considered neighbors
 * @param minPts min number of points required to become a cluster
 * @returns 
 */
async function dbscanClustering(embeddings: number[][], epsilon: number, minPts: number) {
    const dbscan = new DBSCAN();
    const clusters = dbscan.run(embeddings, epsilon, minPts);
    return { clusters, noise: dbscan.noise };
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
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("LLM API KEY not found in environment");
    }

    const prompt = createTitlePrompt(questions);
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
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
 * Takes the output of dbscan clustering to obtain the list of questions that belong in each cluster. 
 * @param clusters output of dbscan clustering
 * @param questions full question data list
 * @returns record containing the cluster number and its corresponding question list
 */
function groupQuestionsDBSCAN(clusters: number[][], questions: string[], noise: number[]): Record<number, string[]> {
    const res: Record<number, string[]> = {};
    
    clusters.forEach((clusterIndices, clusterIdx) => {
        res[clusterIdx] = clusterIndices.map(qIdx => questions[qIdx]);
    });

    if (noise.length > 0) {
        res[-1] = noise.map(qIdx => questions[qIdx]);
    }

    return res;
}

/**
 * Performs sentence embedding, kmeans clustering, and LLM prompting to
 * obtain the values needed for the Student Trends feature in the TA Dashboard Preparation Tab.
 * Returns a list of each cluster and its questions along with a title for the cluster.
 * @param questions list of question data
 */
async function kMeansMain(questions: string[]): Promise<TitledCluster[]> {
    const res: TitledCluster[] = [];
    console.time("Total process");
    const embeddings = await getEmbeddings(questions);

    const k = Math.ceil(Math.sqrt(questions.length));
    console.log("kMeans test, k = ", k);

    const c: KMeans = await clusterEmbeddings(embeddings, k);
    // console.log(c);

    const groups: Record<number, string[]> = groupQuestionsByCluster(c, questions);
    // console.log(groups);

    const entries = Object.entries(groups);

    const results = await Promise.all(
        entries.map(async ([clusterIdx, questionsInCluster]) => {
            console.log(`\nCluster ${clusterIdx}:`);
            console.log("Questions:", questionsInCluster);

            try {
                const result = await getTitles(questionsInCluster) as { title: string };
                console.log("Generated title:", result.title);
                return {
                    idx: Number(clusterIdx),
                    data: {
                        title: result.title,
                        questions: questionsInCluster
                    }
                };
            } catch (err) {
                console.error("LLM call failed:", err);
                return {
                    idx: Number(clusterIdx),
                    data: {
                        title: "Untitled",
                        questions: questionsInCluster
                    }
                };
            }  
        })
    )

    for (const r of results) {
        res[r.idx] = r.data;
    }
    console.timeEnd("Total process");
    return res;
}
/**
 * Performs sentence embedding, dbscan clustering, and LLM prompting to
 * obtain the values needed for the Student Trends feature in the TA Dashboard Preparation Tab.
 * Returns a list of each cluster and its questions along with a title for the cluster.
 * @param questions list of question data
 */
async function dbscanMain(questions: string[]): Promise<TitledCluster[]> {
    const res: TitledCluster[] = [];
    console.log("dbscan test");
    console.time("Total process");
    const embeddings = await getEmbeddings(questions);

    const { clusters, noise } = await dbscanClustering(embeddings, 1.0, 2);
    // console.log("Clusters:", clusters);
    // console.log("Noise:", noise);

    const groups = groupQuestionsDBSCAN(clusters, dummyData, noise);
    // console.log(groups);

    for (const [clusterIdx, questionsInCluster] of Object.entries(groups)) {
        console.log(`\nCluster ${clusterIdx}:`);
        console.log("Questions:", questionsInCluster);

        if (clusterIdx === '-1') {
            console.log("(Unclustered/outlier questions)");
            // eslint-disable-next-line no-continue
            continue;
        }

        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await getTitles(questionsInCluster);
            res[Number(clusterIdx)] = { title: result, questions: questionsInCluster };
            console.log("Generated title:", result.title);
        } catch (err) {
            console.error("LLM call failed:", err);
            res[Number(clusterIdx)] = { title: "Untitled", questions: questionsInCluster };
        }
    }
    console.timeEnd("Total process");
    return res;
}

// kmeans vs dbscan below, commenting out one at a time to run specific ones:
kMeansMain(dummyData);
// dbscanMain(dummyData);
// kMeansMain(oberlinData);
// dbscanMain(oberlinData);


// draft work for next portion : D - ignore for now

// export type QuestionData = {
//     questions: string[];
//     tags: FireTag[];
//     timeStamps: FireTimestamp[];
// }

// export const getStudentTrends = async(
//     courseId: string,
// ) : Promise<TrendData[]> => {
//     return [];
// };

// each course you get the end and start dates which are question query time?
// maybe helper func to look through questions collection to find all questions belonging to a course? 
// (iterate through questions in the time range and then if the sessionid's courseid is the courseid inputted, 
// then add to the list?)

// also need to grab like Assignment 1, Assignment 2, etc...
// async function getAssignments()
// from the firetags assoc w the questions, find the name of the prim and sec tags, concat. 

// async function getQuestions( courseId: string ): Promise<QuestionData> {
//     const coursesRef = collection(firestore, "courses");
//     const questionRef = collection(firestore, "questions");
    
    
// }