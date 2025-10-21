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
  
  try {
    // Get all courses
    const coursesSnapshot = await db.collection('courses').get();
    const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${courses.length} courses\n`);
    
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
    console.log(`  Processed: ${processed} courses`);
    console.log(`  Total: ${courses.length} courses`);
    
    console.log(`\nClean structure:`);
    console.log(`  - Only waitTimeMap field`);
    console.log(`  - All 7 days of the week`);
    console.log(`  - Time slots from 7:00 AM to 10:30 PM (30-min intervals)`);
    console.log(`  - All slots initialized to null`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    admin.app().delete();
  }
}

cleanWaitTimeMaps();
