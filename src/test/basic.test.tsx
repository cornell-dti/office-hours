import { expect } from 'chai';
import 'mocha';
import { firestore } from '../firebase';

const hello = () => {
    return "Hello World!";
}

describe('Hello function', function() {
    it('should return hello world', function() {
        expect(hello()).to.equal('Hello World!');
    });
});

describe('Unknown Question', function() {
    it('should not exist', async function() {
        // Expect question one to not exist
        const questionOne = firestore.collection('questions').doc("1").get();
        console.log("Retrieving question");
        const result = await questionOne
        console.log("Retrieved question");

        expect(result.exists).to.be.false;

        return Promise.resolve();
    });
});
