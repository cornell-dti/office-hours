// @ts-nocheck

import { expect } from 'chai';
import sinon from 'sinon';
import { updateCourses } from '../../firebasefunctions/courses'
import { getDummyUser } from '../generators/dummy'
import { firestore } from '../../firebase'


describe('updateCourses', () => {
    it('is called successfully given a dummy user', () => {

        const dummyUser = getDummyUser('first', 'last', [], {});

        const stubCollection = sinon.stub(firestore, 'collection');
        stubCollection.withArgs('users').returns({ 
            doc: () => {} 
        });

        const stubDoc = sinon.stub(firestore.collection('users'), 'doc');
        stubDoc.withArgs('userId').returns({
            update: () => true
        });
        sinon.stub(firestore.collection('users').doc('userId'), 'update').returns(true);
    
        expect(updateCourses('userId', dummyUser)).to.be.true;
        
    })
})