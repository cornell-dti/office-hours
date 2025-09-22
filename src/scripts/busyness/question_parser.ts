import { GoogleGenAI } from "@google/genai";
import { firestore } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Firebase Question Document Analyzer using Google Gemini API
 * Analyze an incoming question document request adn categories the question by complexity, type, topic, and estimate time interval
 */

interface QuestionData {
    content: string;
    position: string | number;
    status: string;
}

// Import FireQuestion type
declare interface FireQuestion {
    askerId: string;
    answererId: string;
    content: string;
    sessionId: string;
    primaryTag: string;
    secondaryTag: string;
    questionId: string;
    status: "assigned" | "resolved" | "retracted" | "unresolved" | "no-show";
    timeEntered: any;
    timeAddressed?: any;
    timeAssigned?: any;
    taComment?: string;
    studentComment?: string;
    wasNotified: boolean;
    position?: number;
    isVirtual?: boolean;
    taNew?: boolean;
    studentNew?: boolean;
}

/**
 * Creates the analysis prompt for the selected LLM
 * @param data - Extracted question document data
 * @returns {string} - Formatted prompt with specified fields
 */
function createAnalysisPrompt(data: QuestionData) {
    return `
        Analyze the following question and categorize it according to the specified format.

        Question Content: "${data.content}"
        Position in Queue: "${data.position}"
        Question Status: "${data.status}"

        Please analyze this request and return a JSON object with the following structure:

        {
            "complexity": "[simple | moderate | complex]",
            "type": "[conceptual | debugging | implementation | configuration | optimization | research]",
            "topic": "general subject area based on keywords (e.g., 'react-js', 'database-sql', 'authentication', 'testing', 'data-structure', 'algorithms', etc.)",
            "estimatedTimeRange": "[0-5 | 6-10 | 11-15 | 16-25 | 26+]",
            "reasoning": "Brief explanation of the categorization"
        }

        Return only the JSON object, no additional text.
    `;
}

async function analyzeFirebaseQuestion(question: FireQuestion) {
    if (!question) {
        throw new Error("Question document is required!");
    }
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("LLM API KEY not found in environment");
    }

    const analysisData = {
        content: question.content || "",
        position: question.position || "",
        status: question.status || "",
    };

    const prompt = createAnalysisPrompt(analysisData);

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
    return JSON.parse(response.text);
}

const questionIds = ["01CWNXhkcOw6J5CamAlA", "01Z9VPg1olWX9UJEsOcm", "0BEHieOWZz27SbAvvzLP"];

async function analyzeQuestions() {
    try {
        for (const questionId of questionIds) {
            console.log(`Fetching question: ${questionId}`);

            // Get the question document from Firebase
            const questionRef = doc(firestore, "questions", questionId);
            const questionSnap = await getDoc(questionRef);

            if (questionSnap.exists()) {
                const data = questionSnap.data() as FireQuestion;
                const analysis = await analyzeFirebaseQuestion(data);
                console.log(`Analysis for ${questionId}:`, analysis);
            } else {
                console.log("No such document!");
            }
        }
    } catch (error) {
        console.error("Error analyzing questions:", error);
    }
}

// Run the analysis
analyzeQuestions();
