
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
        level: parentTagDocId ? 2 : 1,
        name: tagInfo.name
    };
    if (parentTagDocId) {
        tagDocInfo.parentTag = parentTagDocId;
    }
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

const editParentTag = (batch: firebase.firestore.WriteBatch,
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

export const editAssignment = (cond: boolean, tag: FireTag,
    childTags: FireTag[], deletedTags: FireTag[], newTags: NewTag[]) => {
    const batch = firestore.batch();

    const parentTag = firestore.collection('tags').doc(tag.tagId);

    if (cond) {
        editParentTag(batch, tag, childTags)
    }

    deletedTags
        .forEach(firetag =>
            batch.delete(firestore.collection('tags').doc(firetag.tagId)));

    newTags.forEach(tagText => {
        const childTag = firestore.collection('tags').doc();

        const childTagUpdate: Omit<FireTag, 'tagId'> = {
            active: tag.active,
            courseId: tag.courseId,
            level: 2,
            name: tagText.name,
            parentTag: parentTag.id
        };

        batch.set(childTag, childTagUpdate);
    });

    
    batch.commit();

}