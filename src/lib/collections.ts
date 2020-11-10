import firebase from "firebase";

export enum FireCollection {
    SESSIONS = 'sessions',
    COURSES = 'courses',
    USERS = 'users',
    QUESTION = 'question',
    TAGS = 'tags'
}

export class Collections {
    private db: firebase.firestore.Firestore;

    constructor(db: firebase.firestore.Firestore) {
        this.db = db;
    }

    tags(): firebase.firestore.CollectionReference<Omit<FireTag, 'tagId'>> {
        const { db } = this;

        return db.collection(FireCollection.TAGS) as firebase.firestore.CollectionReference<FireTag>;
    }

    questions(): firebase.firestore.CollectionReference<Omit<FireQuestion, 'questionId'>> {
        const { db } = this;

        return db.collection(FireCollection.QUESTION) as firebase.firestore.CollectionReference<FireQuestion>;
    }

    sessions(): firebase.firestore.CollectionReference<Omit<FireSession, 'sessionId'>> {
        const { db } = this;

        return db.collection(FireCollection.SESSIONS) as firebase.firestore.CollectionReference<FireSession>;
    }

    courses(): firebase.firestore.CollectionReference<Omit<FireCourse, 'courseId'>> {
        const { db } = this;

        return db.collection(FireCollection.COURSES) as firebase.firestore.CollectionReference<FireCourse>;
    }

    users(): firebase.firestore.CollectionReference<Omit<FireUser, 'userId'>> {
        const { db } = this;


        return db.collection(FireCollection.USERS) as firebase.firestore.CollectionReference<FireUser>;
    }
}

// eslint-disable-next-line import/no-mutable-exports
let collections!: Collections;

export function initializeCollections(db: firebase.firestore.Firestore): void {
    collections = new Collections(db);
}

export default collections;
