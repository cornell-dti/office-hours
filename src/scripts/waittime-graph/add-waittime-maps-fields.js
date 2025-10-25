/**
 * Wait Time Map -  waitTimeMap with null values
 */

const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Current semester constant - should match constants.ts
const CURRENT_SEMESTER = 'FA25';

// Generate time slots (7am-11pm, 30-min intervals)
function generateTimeSlots() {
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
}

// Create clean wait time map with all null values
function createCleanWaitTimeMap() {
  const timeSlots = generateTimeSlots();
  const waitTimeMap = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    waitTimeMap[day] = {};
    timeSlots.forEach(slot => {
      waitTimeMap[day][slot] = null; // All slots start as null
    });
  });
  
  return waitTimeMap;
}

async function cleanWaitTimeMaps() {
  console.log('Cleaning wait time maps - keeping only waitTimeMap with null values...\n');
  console.log(`Processing only current semester courses (${CURRENT_SEMESTER})\n`);
  
  try {
    // Get only current semester courses
    const coursesQuery = db.collection('courses').where('semester', '==', CURRENT_SEMESTER);
    const coursesSnapshot = await coursesQuery.get();
    const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${courses.length} courses for current semester (${CURRENT_SEMESTER})\n`);
    
    let processed = 0;
    
    for (const course of courses) {
      console.log(`Processing: ${course.id} (${course.name || 'Unnamed'})`);
      
      // Create clean waitTimeMap
      const waitTimeMap = createCleanWaitTimeMap();
      
      // Update the course document with clean waitTimeMap
      await db.collection('courses').doc(course.id).update({
        waitTimeMap: waitTimeMap
      });
      
      console.log(`  Cleaned waitTimeMap`);
      console.log(`     - ${Object.keys(waitTimeMap).length} days`);
      console.log(`     - ${Object.keys(waitTimeMap.monday).length} time slots per day`);
      console.log(`     - All slots initialized to null`);
      processed++;
    }
    
    console.log(`\nSummary:`);
    console.log(`  Processed: ${processed} courses for current semester (${CURRENT_SEMESTER})`);
    console.log(`  Total: ${courses.length} courses`);
    
    console.log(`\nClean structure:`);
    console.log(`  - Only waitTimeMap field`);
    console.log(`  - All 7 days of the week`);
    console.log(`  - Time slots from 7:00 AM to 10:30 PM (30-min intervals)`);
    console.log(`  - All slots initialized to null`);
    console.log(`  - Only processed current semester courses to avoid unnecessary Firebase reads`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    admin.app().delete();
  }
}

cleanWaitTimeMaps();
