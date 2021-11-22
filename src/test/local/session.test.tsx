// @ts-nocheck

import { expect } from 'chai';
import sinon from 'sinon';
import { deleteSession } from '../../firebasefunctions/session'
import { firestore } from '../../firebase'


describe('deleteSession', () => { 
    afterEach(() => {
      sinon.restore();
    });

    it('is called successfully', () => {
        const stubCollection = sinon.stub(firestore, 'collection');
        stubCollection.withArgs('sessions').returns({ 
            doc: () => {} 
        });

        const stubDoc = sinon.stub(firestore.collection('sessions'), 'doc');
        stubDoc.withArgs('sessionId').returns({
            delete: () => {}
        });

        const stubDelete = sinon.stub(firestore.collection('sessions').doc('sessionId'), 'delete');
        stubDelete.returns(true);

        deleteSession('sessionId')

        sinon.assert.calledOnce(stubDelete);
    })

})