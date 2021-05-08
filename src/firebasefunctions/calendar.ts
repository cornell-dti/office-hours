import { firestore } from '../firebase';

export const getQuery = (courseId: string) => firestore.collection('sessions').where('courseId', '==', courseId);