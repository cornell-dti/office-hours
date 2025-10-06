import { GoogleGenAI } from "@google/genai";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from '../firebase';
import { Timestamp } from "firebase-admin/firestore";

/**Inteface for written feedback being sent to LLM*/
interface FeedbackData {
    content: string;
}

/**Interface for a single feedback record*/
interface FeedbackRecord {
    efficiency: number;
    organization: number;
    overallExperience: number;
    timeStamp: Timestamp;
    writtenFeedback: string;

}
/**Inteface for feedback of one user*/
interface Feedback {
    courses: string[]; 
    content: string;
    feedbackList: FeedbackRecord[];
    firstName: string;
    lastName: string;
    phoneNumber: string;
    photoUrl: string;
    roles: {[courseId: string]: string};
    textNotifsEnabled: boolean;
    textPrompted: boolean;
};

/**Constructs prompt for LLM with written feedback */
function createAnalysisPrompt(feedback: FeedbackData) {
    return `
        Analyze the following feedback and categorize it according to the specified format.
        Feedback Content: "${feedback.content}"
        Please analyze this request and return a JSON object with the following structure:
        {
            "length": "[short | medium | long]",
            "type": "[constructive | critical | praise]",                
            "appropriateness": "[0-5 | 6-10 | 11-15 | 16-25 | 26+]",
            "inappropriate language": "[yes | no]",
            "reasoning": "Brief explanation of the categorization"
        }
        Return only the JSON object, no additional text.
    `;
}

/**Takes in one feedback record, prompts LLM to review it, and returns the 
 * LLM's response
 */
async function analyzeFeedback(feedback: FeedbackRecord) {
    if (!feedback) {
        throw new Error("Question document is required!");
    }
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("LLM API KEY not found in environment");
    }

    const analysisData = {
        content: feedback.writtenFeedback || "",
    };

    const prompt = createAnalysisPrompt(analysisData);
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

/**Nikhill Andrew's userId*/
const userId = "xSq2hFlgsWgzUIbwawsUKjT1w4B2"

/**Loops through feedback list for one user
 * and returns feedback on each feedback record.
 */
async function analyzeFeedbackResponses() {
    try {
        console.log(`Getting response: ${userId}`);
        const feedbackRef = doc(firestore, "users", userId);
        const feedbackSnap = await getDoc(feedbackRef);

        if (feedbackSnap.exists()) {
            const data = feedbackSnap.data() as Feedback;
            for (const record of data.feedbackList) {
                const analysis = await analyzeFeedback(record);
                console.log(`Analysis for ${userId}:`, analysis);
            }
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error analyzing feedback:", error);
    }
}

analyzeFeedbackResponses()
            
