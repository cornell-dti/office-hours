import collections from '../collections';

export function deleteSession(sessionId: string): void {
    collections.sessions().doc(sessionId).delete();
}