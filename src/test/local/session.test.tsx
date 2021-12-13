// @ts-nocheck

import sinon from 'sinon';
import { deleteSession, addSession, updateSession, getUsersFromSessions } from '../../firebasefunctions/session'
import { firestore } from '../../firebase'
import { getDummySession, getDummySessionSeries } from '../generators/dummysession'
import { expect } from 'chai';


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

describe('addSession', () => { 
    afterEach(() => {
        sinon.restore();
    });

    it('is called successfully', () => {
        const dummySession = getDummySession();
        const stubCollection = sinon.stub(firestore, 'collection');
        stubCollection.withArgs('sessions').returns({ 
            add: () => {} 
        });

        const stubAdd = sinon.stub(firestore.collection('sessions'), 'add');
        stubAdd.withArgs(dummySession).returns({
            then: () => {}
        });

        const stubThen = sinon.stub(firestore.collection('sessions').add(dummySession), 'then');
        stubThen.returns(true);

        expect(addSession(dummySession)).to.be.true;
    })

})

describe('updateSession', () => { 
    afterEach(() => {
        sinon.restore();
    });

    it('is called successfully', () => {
        const oldSession = getDummySession();
        const newSession = getDummySession();
        const stubCollection = sinon.stub(firestore, 'collection');
        stubCollection.withArgs('sessions').returns({ 
            doc: () => {} 
        });

        const stubDoc = sinon.stub(firestore.collection('sessions'), 'doc');
        stubDoc.withArgs(oldSession.sessionId).returns({
            update: () => true
        });
        sinon.stub(firestore.collection('sessions').doc(oldSession.sessionId), 'update').returns(true);
    
        expect(updateSession(oldSession, newSession)).to.be.true;
    })

})

describe('getUsersFromSessions', () => { 
    afterEach(() => {
        sinon.restore();
    });

    it('is called successfully', () => {
        const dummySessions = getDummySessionSeries();
        const stubCollection = sinon.stub(firestore, 'collection');
        stubCollection.withArgs('users').returns({ 
            doc: () => {} 
        });

        const stubDoc = sinon.stub(firestore.collection('users'), 'doc');
        stubDoc.withArgs('id').returns({
            get: () => true
        });
        sinon.stub(firestore.collection('sessions').doc('id'), 'get').returns(true);
    
        expect(getUsersFromSessions(dummySessions)).to.be.true;
    })

})