import { firestore } from '../firebase';
import { query, collection, where } from 'firebase/firestore';

export const getQuery = (courseId: string) => query(collection(firestore, 'sessions'), where('courseId', '==', courseId));