/**
 * Populate Historical Wait Time Data for All Courses
 * This script will calculate and populate waitTimeMap for all courses in Firebase
 */

const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();



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
      slots.push(timeStr);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Get sessions for a specific time slot
async function getSessionsForTimeSlot(courseId, dayOfWeek, timeSlot, weeksBack = 8) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeksBack * 7));

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
      
      const sessionDayIndex = (sessionDate.getDay() + 6) % 7;
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const sessionDay = dayNames[sessionDayIndex];
      
      if (sessionDay === dayOfWeek) {
        const sessionHour = sessionDate.getHours();
        const sessionMinute = sessionDate.getMinutes();
        
        if (sessionHour === hour) {
          if (timeSlot.includes(':00')) {
            if (sessionMinute < 30) {
              sessions.push(session);
            }
          } else if (timeSlot.includes(':30')) {
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

// Build waitTimeMap for a course
async function buildWaitTimeMapForCourse(courseId, weeksBack = 8) {
  const waitTimeMap = {};
  
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  weekdays.forEach(day => {
    waitTimeMap[day] = {};
    TIME_SLOTS.forEach(slot => {
      waitTimeMap[day][slot] = null;
    });
  });
  
  let totalProcessed = 0;
  
  for (const dayOfWeek of weekdays) {
    for (const timeSlot of TIME_SLOTS) {
      const sessions = await getSessionsForTimeSlot(courseId, dayOfWeek, timeSlot, weeksBack);
      const avgWaitTime = calculateAverageWaitTimeFromSessions(sessions);
      
      waitTimeMap[dayOfWeek][timeSlot] = Math.round(avgWaitTime);
      
      if (sessions.length > 0) {
        totalProcessed += sessions.length;
      }
    }
  }
  
  return { waitTimeMap, totalProcessed };
}

// Main function to populate all courses
async function populateAllCourses() {
  try {
    console.log('Populating Historical Wait Time Data for All Courses');
    console.log('======================================================\n');
    
    // Get all courses
    const coursesRef = db.collection('courses');
    const coursesSnapshot = await coursesRef.get();
    
    if (coursesSnapshot.empty) {
      console.error('No courses found in Firebase!');
      return;
    }
    
    console.log(`Found ${coursesSnapshot.size} courses`);
    
    let processedCourses = 0;
    let totalSessions = 0;
    
    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      const courseData = courseDoc.data();
      const courseName = courseData.name || 'Unknown';
      
      console.log(`\nProcessing course: ${courseName} (${courseId})`);
      
      try {
        // Check if course has sessions
        const sessionsRef = db.collection('sessions');
        const sessionsQuery = sessionsRef.where('courseId', '==', courseId);
        const sessionsSnapshot = await sessionsQuery.get();
        
        if (sessionsSnapshot.empty) {
          console.log(`  No sessions found for ${courseName}`);
          continue;
        }
        
        console.log(`  Found ${sessionsSnapshot.size} sessions`);
        
        // Build waitTimeMap for this course
        const { waitTimeMap, totalProcessed } = await buildWaitTimeMapForCourse(courseId, 8);
        
        if (totalProcessed > 0) {
          // Update the course document
          await db.collection('courses').doc(courseId).update({
            waitTimeMap
          });
          
          console.log(`  Updated waitTimeMap with ${totalProcessed} sessions`);
          console.log(`  Historical data populated for ${courseName}`);
          
          processedCourses++;
          totalSessions += totalProcessed;
        } else {
          console.log(`  No valid session data found for ${courseName}`);
        }
        
      } catch (error) {
        console.error(`  Error processing ${courseName}:`, error.message);
      }
    }
    
    console.log('\nHistorical Data Population Complete!');
    console.log('========================================');
    console.log(`Processed ${processedCourses} courses`);
    console.log(`Total sessions processed: ${totalSessions}`);
    console.log('\nAll courses now have historical wait time data!');
    console.log('The frontend can now display wait time predictions.');
    
  } catch (error) {
    console.error('\nPopulation failed:', error);
    process.exit(1);
  } finally {
    admin.app().delete();
  }
}

// Run the population
populateAllCourses();
