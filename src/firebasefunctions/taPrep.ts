/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { pipeline } from "@huggingface/transformers";
import { DBSCAN } from "density-clustering";
import kmeans, { KMeans } from "kmeans-ts";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config'; 

export type TrendData = {
    title: string, 
    volume: number, 
    mention: FireTimestamp,
    assignment: FireTag,
    questions: string[]
};

// export type QuestionData = {
//     questions: string[];
//     tags: FireTag[];
//     timeStamps: FireTimestamp[];
// }

const dummyData = [
    // Recursion basics / base cases
    "How do I identify the base case?",
    "Why do we need a base case in recursion?",
    "What happens if I forget the base case?",
    "Can a recursive function have multiple base cases?",
    
    // Call stack / memory
    "What is a call stack?",
    "How does memory work with recursion?",
    "Why do I get a stack overflow error?",
    "How deep can recursion go before crashing?",
    "What's the difference between stack and heap memory?",
    
    // Recursion vs iteration
    "How do loops differ from recursion?",
    "When should I use recursion instead of a loop?",
    "Is recursion slower than iteration?",
    "Can every recursive function be written as a loop?",
    
    // Big O / complexity
    "What is Big O notation?",
    "How do I calculate time complexity?",
    "What's the difference between O(n) and O(n^2)?",
    "Why does Big O ignore constants?",
    "What is space complexity?",
    "How do I analyze recursive time complexity?",
    
    // Sorting algorithms
    "How does merge sort work?",
    "What is the time complexity of quicksort?",
    "When is bubble sort actually useful?",
    "What makes merge sort stable?",
    "How do I choose between sorting algorithms?",
    
    // Data structures
    "What is a linked list?",
    "When should I use an array vs a linked list?",
    "How do hash tables work?",
    "What is a binary search tree?",
    "Why are trees useful in programming?",
    "What's the difference between a stack and a queue?"
];

// also need to grab like Assignment 1, Assignment 2, etc...
// async function getAssignments()
// from the firetags assoc w the questions, find the name of the prim and sec tags, concat. 

async function getEmbeddings(questions: string[]){
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(questions, { pooling: 'mean', normalize: true });
    return output.tolist();
}

async function clusterEmbeddings(embeddings: number[][], k = 2){
    const clusters: KMeans = kmeans(embeddings, k);
    return clusters;
}

async function dbscanClustering(embeddings: number[][], epsilon: number, minPts: number) {
    const dbscan = new DBSCAN();
    const clusters = dbscan.run(embeddings, epsilon, minPts);
    return { clusters, noise: dbscan.noise };
}

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

async function getTitles(questions: string[]) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("LLM API KEY not found in environment");
    }

    const prompt = createTitlePrompt(questions);
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
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

async function main() {
    console.time("Total process");
    const embeddings = await getEmbeddings(dummyData);

    // const k = Math.ceil(Math.sqrt(dummyData.length));

    const c: KMeans = await clusterEmbeddings(embeddings, 7);
    console.log(c);

    const groups = groupQuestionsByCluster(c, dummyData);
    console.log(groups);

    for (const [clusterIdx, questionsInCluster] of Object.entries(groups)) {
        console.log(`\nCluster ${clusterIdx}:`);
        console.log("Questions:", questionsInCluster);

        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await getTitles(questionsInCluster);
            console.log("Generated title:", result.title);
        } catch (err) {
            console.error("LLM call failed:", err);
        }
    }
    console.timeEnd("Total process");
}

async function dbscanMain() {
    console.time("Total process");
    const embeddings = await getEmbeddings(dummyData);

    const { clusters, noise } = await dbscanClustering(embeddings, 1.0, 2);
    console.log("Clusters:", clusters);
    console.log("Noise:", noise);

    const groups = groupQuestionsDBSCAN(clusters, dummyData, noise);
    console.log(groups);

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
            console.log("Generated title:", result.title);
        } catch (err) {
            console.error("LLM call failed:", err);
        }
    }
    console.timeEnd("Total process");
}

// export const getStudentTrends = async(
//     courseId: string,
// ) : Promise<TrendData[]> => {
//     return [];
// };
// each course you get the end and start dates which are question query time?
// maybe helper func to look through questions collection to find all questions belonging to a course? 
// (iterate through questions in the time range and then if the sessionid's courseid is the courseid inputted, 
// then add to the list?)


// kmeans vs dbscan below:
main();
// dbscanMain();