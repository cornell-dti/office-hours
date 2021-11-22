// @ts-nocheck

import { expect } from 'chai';
import sinon from 'sinon';
import { getQuery } from '../../firebasefunctions/calendar'
import { firestore } from '../../firebase'


describe('getQuery', () => {
    afterEach(() => {
      sinon.restore();
    }); 

    it('is called successfully', () => {
        const stubCollection = sinon.stub(firestore, 'collection');
        stubCollection.withArgs('sessions').returns({ 
            where: () => {} 
        });

        const stubDoc = sinon.stub(firestore.collection('sessions'), 'where');
        stubDoc.withArgs('courseId', '==', 'courseId').returns(true);
    
        expect(getQuery('courseId')).to.be.true;

    })

})