
import firebase from 'firebase/app';
import { firestore } from '../firebase';


const createTag = (
    batch: firebase.firestore.WriteBatch,
    tagInfo: Omit<FireTag, 'tagId' | 'level'>,
    parentTagDocId?: string) => {

    // need to create this first so the child tags have the doc reference
    const tag = firestore.collection('tags').doc();
    
    const tagDocInfo: Omit<FireTag, 'tagId'> = {
        active: tagInfo.active,
        courseId: tagInfo.courseId,
        level: parentTagDocId ? 1 : 2,
        name: tagInfo.name,
        parentTag: parentTagDocId
    };
    batch.set(tag, tagDocInfo);

    return tag;
}

export const createAssignment = (currentTag: Omit<FireTag, 'tagId' | 'level'>, newTags: NewTag[]) => {
    
    const batch = firestore.batch();


    // need to create this first so the child tags have the doc reference
    const parentTag = createTag(batch, currentTag)

    // below is essentially add new child a bunch of times
    newTags.map(tagText =>
        createTag(batch, {
            active: currentTag.active,
            courseId: currentTag.courseId,
            name: tagText.name
        }, parentTag.id)

    );
    batch.commit();
    
    return parentTag;
}

export const editParentTag = (batch: firebase.firestore.WriteBatch,
    thisTag: FireTag, childTags: FireTag[]) => {
    const parentTag = firestore.collection('tags').doc(thisTag.tagId);
    batch.update(parentTag, {
        name: thisTag.name, 
        active: thisTag.active
    });
    childTags.forEach(childTag => {
        const childTagDoc = firestore.collection('tags').doc(childTag.tagId);
        batch.update(childTagDoc, {
            active: thisTag.active
        });
    })
}