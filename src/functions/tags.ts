import * as firebase from "firebase";

const TAG_COLLECTION = 'tags';

/**
 * Removes an assignment and (optionally) any child tags.
 * @param firestore a firestore instance
 * @param tag the tag to remove
 * @param childTags any child tags to remove
 */
export function removeAssignment(
    firestore: firebase.firestore.Firestore,
    tag: FireTag,
    childTags: FireTag[] = []
) {
    const batch = firestore.batch();
      
    const tags = firestore.collection(TAG_COLLECTION);
    const parentTag = tags.doc(tag.tagId);

    // Delete parent tag.
    batch.delete(parentTag);

    // Delete child tags.
    childTags.forEach(firetag => {
        batch.delete(tags.doc(firetag.tagId));
    });

    return batch.commit();
}