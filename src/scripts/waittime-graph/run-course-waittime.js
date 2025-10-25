/**
 * Wait Time Calculations for individual course
 */

const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const COURSE_ID = '3780';

// Current semester constant - should match constants.ts
const CURRENT_SEMESTER = 'FA25';

// Helper function to calculate mean
const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;

// Generate time slots (7am-11pm, 30-min intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour < 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      const timeStr = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      // Convert to match test data format (no zero padding for single digit hours)
      const formattedTime = timeStr.replace(/^0(\d)/, '$1');
      slots.push(formattedTime);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// FIXED: Get sessions for a specific time slot
async function getSessionsForTimeSlot(courseId, dayOfWeek, timeSlot, weeksBack = 4) {
  try {
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

    const sessionsRef = db.collection('sessions');
    const sessionsQuery = sessionsRef
      .where('courseId', '==', courseId)
      .where('startTime', '>=', Timestamp.fromDate(startDate))
      .where('startTime', '<=', Timestamp.fromDate(endDate));

    const querySnapshot = await sessionsQuery.get();
    const sessions = [];

    querySnapshot.forEach((doc) => {
      const session = doc.data();
      const sessionDate = session.startTime.toDate();
      
      // Check day of week
      const sessionDayIndex = (sessionDate.getDay() + 6) % 7;
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const sessionDay = dayNames[sessionDayIndex];
      
      if (sessionDay === dayOfWeek) {
        const sessionHour = sessionDate.getHours();
        const sessionMinute = sessionDate.getMinutes();
        
        // FIXED: Simple time matching logic
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
}

// Calculate average wait time from sessions
function calculateAverageWaitTimeFromSessions(sessions) {
  if (sessions.length === 0) return 0;
  
  const validSessions = sessions.filter(session => session.assignedQuestions > 0);
  if (validSessions.length === 0) return 0;
  
  const sessionAverages = validSessions.map(session => 
    session.totalWaitTime / session.assignedQuestions
  );
  
  const sum = sessionAverages.reduce((acc, avg) => acc + avg, 0);
  return sum / sessionAverages.length;
}

// Build full historical waitTimeMap from sessions
async function buildWaitTimeMapFromSessions(courseId, weeksBack = 4) {
  const waitTimeMap = {};
  
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  weekdays.forEach(day => {
    waitTimeMap[day] = {};
    TIME_SLOTS.forEach(slot => {
      waitTimeMap[day][slot] = null;
    });
  });
  
  console.log('Processing historical data...');
  let totalProcessed = 0;
  
  for (const dayOfWeek of weekdays) {
    console.log(`\nProcessing ${dayOfWeek}...`);
    for (const timeSlot of TIME_SLOTS) {
      const sessions = await getSessionsForTimeSlot(courseId, dayOfWeek, timeSlot, weeksBack);
      const avgWaitTime = calculateAverageWaitTimeFromSessions(sessions);
      
      waitTimeMap[dayOfWeek][timeSlot] = Math.round(avgWaitTime / 60); // Convert to minutes
      
      if (sessions.length > 0) {
        totalProcessed += sessions.length;
        console.log(`  ${dayOfWeek} ${timeSlot}: ${sessions.length} sessions, avg ${Math.round(avgWaitTime)}s (${Math.round(avgWaitTime/60)} min)`);
        // Debug: show session IDs
        sessions.forEach(s => {
          const sessionTime = s.startTime.toDate().toLocaleTimeString();
          console.log(`    - ${s.sessionId || 'NO_ID'} at ${sessionTime} (${s.assignedQuestions} questions, ${s.totalWaitTime}s)`);
        });
      }
    }
    console.log(`Completed ${dayOfWeek}`);
  }
  
  console.log(`\nProcessed ${totalProcessed} total sessions across all slots`);
  
  const courseRef = db.collection('courses').doc(courseId);
  await courseRef.update({
    waitTimeMap
  });
  
  console.log('Saved waitTimeMap to Firebase');
  
  return { waitTimeMap };
}

// Analyze the calculated historical data
function analyzeHistoricalData(waitTimeMap) {
  console.log('\nHistorical Data Analysis:');
  console.log('============================');
  
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  weekdays.forEach(day => {
    const dayData = waitTimeMap[day];
    
    const slotsWithData = Object.entries(dayData).filter(([slot, time]) => time > 0);
    
    if (slotsWithData.length > 0) {
      console.log(`\n${day.toUpperCase()}:`);
      slotsWithData.forEach(([slot, time]) => {
        console.log(`  ${slot}: ${time} minutes`);
      });
    }
  });
  
  const allTimes = Object.values(waitTimeMap).flatMap(day => 
    Object.values(day).filter(time => time > 0)
  );
  
  if (allTimes.length > 0) {
    const avgTime = mean(allTimes);
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    
    console.log(`\nSummary:`);
    console.log(`  Total slots with data: ${allTimes.length}`);
    console.log(`  Average wait time: ${Math.round(avgTime)} minutes`);
    console.log(`  Range: ${Math.round(minTime)} - ${Math.round(maxTime)} minutes`);
  }
}

// Main test function
async function runTest() {
  try {
    console.log('Wait Time Historical Data Calculation');
    console.log('===============================================\n');
    
    console.log(`Using course: ${COURSE_ID}`);
    
    // Verify course is in current semester
    const courseRef = db.collection('courses').doc(COURSE_ID);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists()) {
      console.error(`Course ${COURSE_ID} not found!`);
      return;
    }
    
    const courseData = courseDoc.data();
    if (courseData.semester !== CURRENT_SEMESTER) {
      console.warn(`Warning: Course ${COURSE_ID} is from semester ${courseData.semester}, not current semester (${CURRENT_SEMESTER})`);
      console.warn('This script is optimized to only process current semester courses to avoid unnecessary Firebase reads.');
    }
    
    // Calculate historical averages from REAL session data
    console.log('\nCalculating historical averages from real session data...');
    console.log('Looking back 4 weeks from today...');
    
    const { waitTimeMap } = await buildWaitTimeMapFromSessions(COURSE_ID, 4);
    
    // Analyze results
    analyzeHistoricalData(waitTimeMap);
    
    console.log('\nHistorical data calculation completed successfully!');
    console.log(`\nCourse ${COURSE_ID} now has updated waitTimeMap with historical averages`);
    console.log('This data can be used by the frontend to show wait time predictions');
    
  } catch (error) {
    console.error('\nCalculation failed:', error);
    process.exit(1);
  } finally {
    admin.app().delete();
  }
}

runTest();
