// waitTimeMap.ts - Utility functions for reading from waitTimeMap structure
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export type WaitTimeMapData = {
  barData: Array<{ dayOfWeek: string } & { [timeSlot: string]: number }>;
  timeKeys: string[];
  yMax: number;
  legend: string;
  OHDetails: { [id: string]: { ta: string; location: string; startHour: string; endHour: string; avgWaitTime: string } };
  debug?: {
    courseId: string;
    hasData: boolean;
    populatedSlots: number;
  };
};

const DAY_NAMES = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

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
    console.log('[waitTimeMap] Fetching data for courseId:', courseId);
    
    // Get the course document
    const courseDoc = await getDoc(doc(firestore, 'courses', courseId));
    
    if (!courseDoc.exists()) {
      throw new Error(`Course ${courseId} not found`);
    }
    
    const courseData = courseDoc.data();
    const waitTimeMap = courseData.waitTimeMap;
    
    console.log('[waitTimeMap] Course data:', courseData);
    console.log('[waitTimeMap] WaitTimeMap:', waitTimeMap);
    
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
    
    console.log('[waitTimeMap] Processing waitTimeMap data...');
    
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
          row[timeSlot] = Math.round(waitTime);
          maxWaitTime = Math.max(maxWaitTime, waitTime);
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
    
    console.log('[waitTimeMap] Final result:', {
      barData: barData.length,
      timeKeys: TIME_SLOTS.length,
      yMax,
      populatedSlots,
      sampleBarData: barData.slice(0, 2)
    });
    
    console.log('[waitTimeMap] Full barData:', barData);
    console.log('[waitTimeMap] Time slots:', TIME_SLOTS.slice(0, 10));
    
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
    console.error('[waitTimeMap] Error building data:', error);
    
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
    console.error('[hasSessionsOnDate] Error checking sessions:', error);
    return false;
  }
};
