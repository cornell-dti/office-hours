import { GoogleGenAI } from "@google/genai";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { firestore } from '../firebase';

/**Inteface for written feedback being sent to LLM*/
interface FeedbackData {
    content: string;
}



/**Constructs prompt for LLM with written feedback */
function createAnalysisPrompt(feedback: FeedbackData) {
    return `
        Analyze the following feedback and determine whether 
        it is appropriate or not based on the following criteria.
        Feedback Content: "${feedback.content}"
        Please analyze this request and return a yes or no for whether the feedback
         is acceptable or not based on the criteria below.:
        {           
            "appropriateness": "[0-5 | 6-10 | 11-15 | 16-25 | 26+]",
            "inappropriate language": "[yes | no]",
        }
        Return "yes" if the appropriateness is 10 or higher and innapropriate language is no. 
        Return "no" otherwise.
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



/**Loops through feedback list for one user
 * and returns feedback on each feedback record.
 */
async function analyzeFeedbackResponses(userId : string) {
    try {
        const feedbackRef = doc(firestore, "users", userId);
        const feedbackSnap = await getDoc(feedbackRef);
        const analyses: any[] = [];

        if (feedbackSnap.exists()) {
            const data = feedbackSnap.data() as FireUser;
            if (data.feedbackList === undefined) {
                console.log("Undefined feedback list")
                return analyses;
            }
            const list = data.feedbackList!
            for (const record of list) {
                // eslint-disable-next-line  
                if (record.verification === undefined) {
                    const analysis = await analyzeFeedback(record);
                if (analysis === "yes") {
                    record.verification = true
                } else {
                    record.verification = false
                }
                analyses.push(analysis);
                // eslint-disable-next-line no-console
                console.log(`Analysis for ${userId}:`, analysis);
                } 
            }
            const updatedData: Partial<FireUser> = {feedbackList: list, verified: true}
            await updateDoc(feedbackRef, updatedData)
            return analyses;
        } else {
            // eslint-disable-next-line no-console
            console.log("No such document!");
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error analyzing feedback:", error);
    }
    
    
}

export default analyzeFeedbackResponses;          
