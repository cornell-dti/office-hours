// waitTimeMap.ts - Utility functions for reading from waitTimeMap structure
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
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


// Generate time slots (12am-11:30pm, 30-min intervals) - full 24 hour coverage
export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    // Generate slots for all 24 hours (0-23)
    for (let hour = 0; hour <= 23; hour++) {
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
 * Generate initial waitTimeMap structure with all time slots for all days
 * All slots are initialized to null (indicating no data yet)
 */
export const generateInitialWaitTimeMap = (): { [weekday: string]: { [timeSlot: string]: number | null } } => {
    const timeSlots = generateTimeSlots();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const waitTimeMap: { [weekday: string]: { [timeSlot: string]: number | null } } = {};
    
    days.forEach(day => {
        waitTimeMap[day] = {};
        timeSlots.forEach(slot => {
            waitTimeMap[day][slot] = null; // null indicates no data yet, vs 0 which would mean zero wait time
        });
    });
    
    return waitTimeMap;
};

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
                    // Show at least 1 minute when waitTime > 0 to ensure it appears on graph
                    const minutes = Math.max(1, Math.round(waitTime / 60));
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
 * Get the earliest start time and latest end time for sessions on a specific date
 * Returns { earliestStart: Date | null, latestEnd: Date | null }
 */
export const getSessionTimeRange = async (
    courseId: string, 
    date: Date
): Promise<{ earliestStart: Date | null; latestEnd: Date | null }> => {
    try {
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
            where('startTime', '>=', Timestamp.fromDate(startOfDay)),
            where('startTime', '<=', Timestamp.fromDate(endOfDay))
        );
    
        const querySnapshot = await getDocs(sessionsQuery);
        
        if (querySnapshot.empty) {
            return { earliestStart: null, latestEnd: null };
        }
    
        let earliestStart: Date | null = null;
        let latestEnd: Date | null = null;
    
        querySnapshot.forEach((doc) => {
            const session = doc.data() as FireSession;
            const sessionStart = session.startTime.toDate();
            const sessionEnd = session.endTime.toDate();
        
            if (!earliestStart || sessionStart < earliestStart) {
                earliestStart = sessionStart;
            }
            if (!latestEnd || sessionEnd > latestEnd) {
                latestEnd = sessionEnd;
            }
        });
    
        return { earliestStart, latestEnd };
    } catch (error) {
        return { earliestStart: null, latestEnd: null };
    }
};

