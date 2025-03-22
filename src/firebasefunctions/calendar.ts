import { query, collection, where } from 'firebase/firestore';
import { firestore } from '../firebase';

export const getQuery = (courseId: string) => 
    query(collection(firestore, 'sessions'), where('courseId', '==', courseId));