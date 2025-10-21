// waitTimeMap.ts - Utility functions for reading from waitTimeMap structure
import { doc, getDoc, collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase';

export type WaitTimeMapData = {
    barData: Array<{ dayOfWeek: string } & { [timeSlot: string]: number }>;
    timeKeys: string[];
    yMax: number;
    legend: string;
    OHDetails: { 
        [id: string]: { 
            ta: string; 
            location: string; 
            startHour: string; 
            endHour: string; 
            avgWaitTime: string 
        } 
    };
    debug?: {
        courseId: string;
        hasData: boolean;
        populatedSlots: number;
    };
};


// Generate time slots (7am-11pm, 30-min intervals) to match the backend structure
const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 7; hour < 23; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = new Date();
            time.setHours(hour, minute, 0, 0);
            const timeStr = time.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            slots.push(timeStr);
        }
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

/**
 * Build wait time data from the waitTimeMap structure in Firestore
 */
export const buildWaitTimeDataFromMap = async (courseId: string): Promise<WaitTimeMapData> => {
    try {
        // Get the course document
        const courseDoc = await getDoc(doc(firestore, 'courses', courseId));
    
        if (!courseDoc.exists()) {
            throw new Error(`Course ${courseId} not found`);
        }
    
        const courseData = courseDoc.data();
        const waitTimeMap = courseData.waitTimeMap;
    
        if (!waitTimeMap) {
            // Return empty structure if no waitTimeMap exists
            return {
                barData: [],
                timeKeys: TIME_SLOTS,
                yMax: 10,
                legend: 'Avg minutes per student',
                OHDetails: {},
                debug: {
                    courseId,
                    hasData: false,
                    populatedSlots: 0
                }
            };
        }
    
        // Convert waitTimeMap to barData format
        const barData: Array<{ dayOfWeek: string } & { [timeSlot: string]: number }> = [];
        let maxWaitTime = 0;
        let populatedSlots = 0;
    
        // Process each day
        Object.entries(waitTimeMap).forEach(([dayName, dayData]) => {
            if (!dayData || typeof dayData !== 'object') return;
      
            const dayOfWeek = dayName.charAt(0).toUpperCase() + dayName.slice(1); // Capitalize first letter
            const row: any = { dayOfWeek };
      
            // Initialize all time slots to 0
            TIME_SLOTS.forEach(slot => {
                row[slot] = 0;
            });
      
            // Fill in actual data
            Object.entries(dayData).forEach(([timeSlot, waitTime]) => {
                if (waitTime !== null && typeof waitTime === 'number' && waitTime > 0) {
                    // Convert seconds to minutes for display
                    const minutes = Math.round(waitTime / 60);
                    row[timeSlot] = minutes;
                    maxWaitTime = Math.max(maxWaitTime, minutes);
                    populatedSlots++;
                }
            });
      
            // Only add days that have some data
            const hasData = Object.values(dayData).some(value => value !== null && value > 0);
            if (hasData) {
                barData.push(row);
            }
        });
    
        // Sort days in order
        barData.sort((a, b) => {
            const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            return order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
        });
    
        const yMax = Math.max(5, Math.ceil(maxWaitTime / 5) * 5);
    
        return {
            barData,
            timeKeys: TIME_SLOTS,
            yMax,
            legend: 'Avg minutes per student',
            OHDetails: {},
            debug: {
                courseId,
                hasData: populatedSlots > 0,
                populatedSlots
            }
        };
    
    } catch (error) {
    
        // Return empty structure on error
        return {
            barData: [],
            timeKeys: TIME_SLOTS,
            yMax: 10,
            legend: 'Avg minutes per student',
            OHDetails: {},
            debug: {
                courseId,
                hasData: false,
                populatedSlots: 0
            }
        };
    }
};

/**
 * Check if a course has any populated wait time data
 */
export const hasWaitTimeData = async (courseId: string): Promise<boolean> => {
    try {
        const data = await buildWaitTimeDataFromMap(courseId);
        return data.debug?.hasData || false;
    } catch {
        return false;
    }
};

/**
 * Check if a course has any sessions on a specific date
 */
export const hasSessionsOnDate = async (courseId: string, date: Date): Promise<boolean> => {
    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { firestore } = await import('../firebase');
    
        // Create start and end of day timestamps
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
    
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
    
        // Query sessions for the course on the specific date
        const sessionsRef = collection(firestore, 'sessions');
        const sessionsQuery = query(
            sessionsRef,
            where('courseId', '==', courseId),
            where('startTime', '>=', startOfDay),
            where('startTime', '<=', endOfDay)
        );
    
        const querySnapshot = await getDocs(sessionsQuery);
        return !querySnapshot.empty;
    } catch (error) {
        return false;
    }
};

/**
 * Get sessions for a specific time slot (per-session method)
 * Parameters:
 *      courseId: Which course to query
 *      dayOfWeek: Day name (e.g., "monday")
 *      timeSlot: Time slot (e.g., "7:00 PM")
 *      weeksBack: How many weeks of historical data to look at (default: 4)
 * Uses simple time matching logic that works correctly
 */
export const getSessionsForTimeSlot = async (
    courseId: string,
    dayOfWeek: string,
    timeSlot: string,
    weeksBack: number = 4
): Promise<FireSession[]> => {
    try {
        // Calculate date range (weeksBack weeks ago to now)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeksBack * 7));

        // Parse time slot (e.g., "7:00 PM" -> 19:00)
        const [time, period] = timeSlot.split(' ');
        const [hourStr] = time.split(':');
        let hour = parseInt(hourStr);
        
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        } else if (period === 'AM' && hour === 12) {
            hour = 0;
        }

        // Query sessions
        const sessionsRef = collection(firestore, 'sessions');
        const sessionsQuery = query(
            sessionsRef,
            where('courseId', '==', courseId),
            where('startTime', '>=', Timestamp.fromDate(startDate)),
            where('startTime', '<=', Timestamp.fromDate(endDate))
        );

        const querySnapshot = await getDocs(sessionsQuery);
        const sessions: FireSession[] = [];

        querySnapshot.forEach((doc) => {
            const session = doc.data() as FireSession;
            const sessionDate = session.startTime.toDate();
            
            // Check day of week
            const sessionDayIndex = (sessionDate.getDay() + 6) % 7;
            const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const sessionDay = dayNames[sessionDayIndex];
            
            if (sessionDay === dayOfWeek) {
                const sessionHour = sessionDate.getHours();
                const sessionMinute = sessionDate.getMinutes();
                
                // Simple time matching logic
                if (sessionHour === hour) {
                    // For 7:00 PM slot: match sessions at 7:00-7:29
                    // For 7:30 PM slot: match sessions at 7:30-7:59
                    if (timeSlot.includes(':00')) {
                        // First half of hour (e.g., 7:00 PM)
                        if (sessionMinute < 30) {
                            sessions.push(session);
                        }
                    } else if (timeSlot.includes(':30')) {
                        // Second half of hour (e.g., 7:30 PM)
                        if (sessionMinute >= 30) {
                            sessions.push(session);
                        }
                    }
                }
            }
        });

        return sessions;
    } catch (error) {
        console.error('Error getting sessions for time slot:', error);
        return [];
    }
};

/**
 * Calculate average wait time from sessions
 * 
 * This function takes a list of sessions and calculates the overall average wait time.
 * It does this by:
 * 1. Filtering out sessions with no questions (can't calculate wait time per question)
 * 2. For each valid session, calculating the average wait time per question
 * 3. Taking the average of all those session averages
 */
export const calculateAverageWaitTimeFromSessions = (sessions: FireSession[]): number => {
    // If no sessions provided, return 0
    if (sessions.length === 0) return 0;
    
    // Only consider sessions that actually had questions assigned
    // (sessions with 0 questions can't have meaningful wait time per question)
    const validSessions = sessions.filter(session => session.assignedQuestions > 0);
    
    // If no valid sessions, return 0
    if (validSessions.length === 0) return 0;
    
    // For each valid session, calculate the average wait time per question
    // Example: if a session had 3 questions and totalWaitTime of 15 minutes,
    // then the average wait time per question was 15/3 = 5 minutes
    const sessionAverages = validSessions.map(session => 
        session.totalWaitTime / session.assignedQuestions
    );
    
    // Sum up all the individual session averages
    const sum = sessionAverages.reduce((acc, avg) => acc + avg, 0);
    
    // Return the overall average across all sessions
    // Example: if we had 2 sessions with averages [5, 10], the overall average is (5+10)/2 = 7.5
    return sum / sessionAverages.length;
};


/**
 * Update running average for a specific slot
 * Uses a simple weighted average approach without requiring waitTimeCount
 */
export const updateRunningAverage = async (
    courseId: string,
    weekday: string,
    slot: string,
    newSessionAvg: number
): Promise<void> => {
    try {
        const courseRef = doc(firestore, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (!courseDoc.exists()) {
            throw new Error(`Course ${courseId} not found`);
        }
        
        const courseData = courseDoc.data();
        const waitTimeMap = courseData.waitTimeMap || {};
        
        // Initialize if not exists
        if (!waitTimeMap[weekday]) waitTimeMap[weekday] = {};
        if (!waitTimeMap[weekday][slot]) waitTimeMap[weekday][slot] = 0;
        
        const prevAvg = waitTimeMap[weekday][slot];
        
        // Simple weighted average: give more weight to historical data
        // If no previous data, use new session average
        // Otherwise, use 80% historical + 20% new (adjustable weight)
        const historicalWeight = 0.8;
        const newWeight = 0.2;
        const newAvg = prevAvg === 0 ? newSessionAvg : (prevAvg * historicalWeight + newSessionAvg * newWeight);
        
        // Update the waitTimeMap
        waitTimeMap[weekday][slot] = Math.round(newAvg);
        
        // Write back to Firestore (only update waitTimeMap)
        await updateDoc(courseRef, {
            waitTimeMap
        });
        
    } catch (error) {
        console.error('Error updating running average:', error);
        throw error;
    }
};

/**
 * Get a specific slot value from waitTimeMap
 */
export const getWaitTimeMapSlot = async (
    courseId: string,
    weekday: string,
    slot: string
): Promise<number> => {
    try {
        const courseRef = doc(firestore, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (!courseDoc.exists()) {
            throw new Error(`Course ${courseId} not found`);
        }
        
        const courseData = courseDoc.data();
        const waitTimeMap = courseData.waitTimeMap || {};
        
        return waitTimeMap[weekday]?.[slot] || 0;
    } catch (error) {
        console.error('Error getting wait time map slot:', error);
        return 0;
    }
};
