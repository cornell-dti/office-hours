
import { doc, writeBatch, DocumentReference } from 'firebase/firestore';
import { firestore } from '../firebase';

const createTag = (
    batch: ReturnType<typeof writeBatch>,
    tagInfo: Omit<FireTag, 'tagId' | 'level'>,
    parentTagDocId?: string
): DocumentReference => {
    const tagRef = doc(firestore, 'tags');
    
    const tagDocInfo: Omit<FireTag, 'tagId'> = {
        active: tagInfo.active,
        courseId: tagInfo.courseId,
        level: parentTagDocId ? 2 : 1,
        name: tagInfo.name,
        parentTag: parentTagDocId ?? undefined
    };

    batch.set(tagRef, tagDocInfo);

    return tagRef;
};

export const createAssignment = (currentTag: Omit<FireTag, 'tagId' | 'level'>, newTags: NewTag[]) => {
    const batch = writeBatch(firestore);
    const parentTagRef = createTag(batch, currentTag);

    newTags.forEach(tagText => {
        createTag(batch, {
            active: currentTag.active,
            courseId: currentTag.courseId,
            name: tagText.name
        }, parentTagRef.id);
    });

    batch.commit();
    
    return parentTagRef;
};

const editParentTag = (
    batch: ReturnType<typeof writeBatch>,
    thisTag: FireTag,
    childTags: FireTag[]
) => {
    const parentTagRef = doc(firestore, 'tags', thisTag.tagId);

    batch.update(parentTagRef, {
        name: thisTag.name, 
        active: thisTag.active
    });

    childTags.forEach(childTag => {
        const childTagRef = doc(firestore, 'tags', childTag.tagId);
        batch.update(childTagRef, {
            active: thisTag.active
        });
    });
};

export const editAssignment = (
    cond: boolean,
    tag: FireTag,
    childTags: FireTag[],
    deletedTags: FireTag[],
    newTags: NewTag[]
) => {
    const batch = writeBatch(firestore);
    const parentTagRef = doc(firestore, 'tags', tag.tagId);

    if (cond) {
        editParentTag(batch, tag, childTags);
    }

    deletedTags.forEach(fireTag => {
        const deleteRef = doc(firestore, 'tags', fireTag.tagId);
        batch.delete(deleteRef);
    });

    newTags.forEach(tagText => {
        const childTagRef = doc(firestore, 'tags');
        const childTagUpdate: Omit<FireTag, 'tagId'> = {
            active: tag.active,
            courseId: tag.courseId,
            level: 2,
            name: tagText.name,
            parentTag: parentTagRef.id
        };

        batch.set(childTagRef, childTagUpdate);
    });

    batch.commit();
};