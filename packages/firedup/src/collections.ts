import { firestore } from "firebase";

export enum FireCollection {
    SESSIONS = 'sessions',
    COURSES = 'courses',
    USERS = 'users',
    QUESTION = 'question',
    TAGS = 'tags'
}

export class Collections {
    private db: firestore.Firestore;

    constructor(db: firestore.Firestore) {
        this.db = db;
    }

    tags(): firestore.CollectionReference<Omit<FireTag, 'tagId'>> {
        const { db } = this;

        return db.collection(FireCollection.TAGS) as firestore.CollectionReference<FireTag>;
    }

    questions(): firestore.CollectionReference<Omit<FireQuestion, 'questionId'>> {
        const { db } = this;

        return db.collection(FireCollection.QUESTION) as firestore.CollectionReference<FireQuestion>;
    }

    sessions(): firestore.CollectionReference<Omit<FireSession, 'sessionId'>> {
        const { db } = this;

        return db.collection(FireCollection.SESSIONS) as firestore.CollectionReference<FireSession>;
    }

    courses(): firestore.CollectionReference<Omit<FireCourse, 'courseId'>> {
        const { db } = this;

        return db.collection(FireCollection.COURSES) as firestore.CollectionReference<FireCourse>;
    }

    users(): firestore.CollectionReference<Omit<FireUser, 'userId'>> {
        const { db } = this;


        return db.collection(FireCollection.USERS) as firestore.CollectionReference<FireUser>;
    }
}

// eslint-disable-next-line import/no-mutable-exports
let collections!: Collections;

export function initializeCollections(db: firestore.Firestore): void {
    collections = new Collections(db);
}

export default collections;
