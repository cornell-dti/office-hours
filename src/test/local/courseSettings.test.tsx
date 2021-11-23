// @ts-nocheck

import sinon from 'sinon';
import { updateSettingsInCourse } from '../../firebasefunctions/courseSettings'
import { getDummyCourse } from '../generators/dummy'
import { firestore } from '../../firebase'


describe('updateSettingsInCourse', () => {
    afterEach(() => {
        sinon.restore();
    });
    
    it('is called successfully', () => {

        const stubCollection = sinon.stub(firestore, 'collection');
        stubCollection.withArgs('courses').returns({ 
            doc: () => {} 
        });
      
        const stubDoc = sinon.stub(firestore.collection('courses'), 'doc');
        stubDoc.withArgs('courseId').returns({
            update: () => true
        });
        const stubUpdate = sinon.stub(firestore.collection('courses').doc('courseId'), 'update');
        stubUpdate.returns(true);

        const dummyCourse: Partial<FireCourse> = getDummyCourse();

        updateSettingsInCourse('courseId', dummyCourse);

        sinon.assert.calledOnce(stubUpdate);
    })
})

