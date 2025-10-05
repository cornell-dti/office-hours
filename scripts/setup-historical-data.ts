import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { calculateHistoricalWaitTimes } from '../functions/src/analytics';

// Initialize Firebase Admin
const serviceAccount = require('../path/to/service-account-key.json');
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

/**
 * Migration script to:
 * 1. Add courseId to all existing questions
 * 2. Calculate historical wait times for all courses
 * 3. Update course documents with historical data
 */
const setupHistoricalData = async () => {
    console.log('🚀 Starting historical data setup...');
    
    try {
        // Step 1: Add courseId to all existing questions
        await addCourseIdToQuestions();
        
        // Step 2: Calculate historical data for all courses
        await calculateHistoricalDataForAllCourses();
        
        console.log('✅ Historical data setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Historical data setup failed:', error);
        throw error;
    }
};

/**
 * Add courseId to all existing questions by getting it from their session
 */
const addCourseIdToQuestions = async () => {
    console.log('📝 Adding courseId to existing questions...');
    
    const sessionsSnapshot = await db.collection('sessions').get();
    console.log(`Found ${sessionsSnapshot.docs.length} sessions`);
    
    let totalUpdated = 0;
    
    for (const sessionDoc of sessionsSnapshot.docs) {
        const session = sessionDoc.data();
        const courseId = session.courseId;
        const sessionId = sessionDoc.id;
        
        if (!courseId) {
            console.log(`⚠️ Skipping session ${sessionId} - no courseId`);
            continue;
        }
        
        // Get all questions for this session
        const questionsSnapshot = await db
            .collection('questions')
            .where('sessionId', '==', sessionId)
            .get();
        
        if (questionsSnapshot.docs.length === 0) continue;
        
        // Update questions in batches
        const batch = db.batch();
        questionsSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { courseId });
        });
        
        await batch.commit();
        totalUpdated += questionsSnapshot.docs.length;
        
        console.log(`✅ Updated ${questionsSnapshot.docs.length} questions for session ${sessionId}`);
    }
    
    console.log(`📊 Total questions updated: ${totalUpdated}`);
};

/**
 * Calculate historical wait times for all courses
 */
const calculateHistoricalDataForAllCourses = async () => {
    console.log('📊 Calculating historical data for all courses...');
    
    const coursesSnapshot = await db.collection('courses').get();
    console.log(`Found ${coursesSnapshot.docs.length} courses`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const courseDoc of coursesSnapshot.docs) {
        const courseId = courseDoc.id;
        const course = courseDoc.data();
        
        console.log(`Processing course: ${course.name} (${courseId})`);
        
        try {
            // Calculate historical data
            const historicalData = await calculateHistoricalWaitTimes(courseId, course.semester);
            
            // Update course document
            await db.doc(`courses/${courseId}`).update({
                historicalWaitTimes: historicalData
            });
            
            console.log(`✅ Completed: ${course.name}`);
            successCount++;
            
        } catch (error) {
            console.error(`❌ Error processing course ${course.name}:`, error);
            errorCount++;
        }
    }
    
    console.log(`📈 Results: ${successCount} successful, ${errorCount} errors`);
};

// Run the migration
setupHistoricalData()
    .then(() => {
        console.log('🎉 Migration script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration script failed:', error);
        process.exit(1);
    });
