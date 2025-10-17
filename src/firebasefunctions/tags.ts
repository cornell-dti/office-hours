
import { doc, collection, writeBatch, WriteBatch } from 'firebase/firestore';
import { firestore } from '../firebase';


const createTag = (
    batch: WriteBatch,
    tagInfo: Omit<FireTag, 'tagId' | 'level'>,
    parentTagDocId?: string) => {

    // need to create this first so the child tags have the doc reference
    const tag = doc(collection(firestore, "tags"));
    
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
    
    const batch = writeBatch(firestore);


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

const editParentTag = (batch: WriteBatch,
    thisTag: FireTag, childTags: FireTag[]) => {
    const parentTag = doc(firestore, 'tags', thisTag.tagId);
    batch.update(parentTag, {
        name: thisTag.name, 
        active: thisTag.active
    });
    childTags.forEach(childTag => {
        const childTagDoc = doc(firestore, 'tags', childTag.tagId);
        batch.update(childTagDoc, {
            active: thisTag.active
        });
    })
}

export const editAssignment = (cond: boolean, tag: FireTag,
    childTags: FireTag[], deletedTags: FireTag[], newTags: NewTag[]) => {
    const batch = writeBatch(firestore);

    const parentTag = doc(firestore, 'tags', tag.tagId);

    if (cond) {
        editParentTag(batch, tag, childTags)
    }

    deletedTags
        .forEach(firetag =>
            firetag.tagId && batch.delete(doc(firestore,'tags', firetag.tagId)));

    newTags.forEach(tagText => {
        const childTag = doc(collection(firestore, "tags"));

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